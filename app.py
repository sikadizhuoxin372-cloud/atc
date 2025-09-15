
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import xml.etree.ElementTree as ET
import os
import subprocess
import uuid
from datetime import datetime
import uvicorn

app = FastAPI(title="TestNexus API", description="测试平台API服务")

# 挂载 static 目录，支持访问 static 下的 html/css/js
app.mount("/static", StaticFiles(directory="static"), name="static")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求模型
from typing import Tuple

def parse_xml_file(file_path) -> Tuple[ET.ElementTree, ET.Element]:
    """解析XML文件并返回tree和root元素"""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"文件不存在: {file_path}")
    tree = ET.parse(file_path)
    root = tree.getroot()
    return tree, root


# 访问根路径时返回 static/index.html
@app.get("/", summary="API首页", description="返回index.html文件")
async def read_root():
    try:
        return FileResponse(os.path.join("static", "index.html"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"加载首页失败: {str(e)}")

# 访问 /page/{filename} 返回 static 目录下的 html 页面
@app.get("/page/{filename}", summary="访问static目录下的html页面")
async def get_static_html(filename: str):
    file_path = os.path.join("static", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="页面不存在")
    return FileResponse(file_path)

@app.get("/load_page", summary="加载页面所有数据")
async def load_page():
    try:
        # 加载测试用例数据
        test_cases = []
        try:
            tree, root = parse_xml_file(os.path.join("data", "testcase.xml"))
            for testcase in root.findall("./testcase"):
                test_case_data = {
                    "id": testcase.get("id"),
                    "name": testcase.get("name"),
                    "description": testcase.find("./description").text if testcase.find("./description") is not None else "",
                    "preconditions": testcase.find("./preconditions").text if testcase.find("./preconditions") is not None else "",
                    "priority": testcase.find("./priority").text if testcase.find("./priority") is not None else "中",
                    "steps": [step.text for step in testcase.findall("./steps/step")],
                    "expected_results": testcase.find("./expected_results").text if testcase.find("./expected_results") is not None else ""
                }
                test_cases.append(test_case_data)
        except Exception as e:
            print(f"加载测试用例数据时出错: {str(e)}")
        
        # 加载测试任务数据
        jobs = []
        try:
            tree, root = parse_xml_file(os.path.join("data", "jobs.xml"))
            for job in root.findall("./job"):
                job_data = {
                    "id": job.get("id"),
                    "name": job.get("name"),
                    "status": job.get("status"),
                    "testcase_ids": job.find("./testcase_ids").text if job.find("./testcase_ids") is not None else "",
                    "start_time": job.find("./start_time").text if job.find("./start_time") is not None else "",
                    "end_time": job.find("./end_time").text if job.find("./end_time") is not None else "",
                    "duration": job.find("./duration").text if job.find("./duration") is not None else "",
                    "executor": job.find("./executor").text if job.find("./executor") is not None else "",
                    "environment": job.find("./environment").text if job.find("./environment") is not None else "",
                    "passed": int(job.find("./passed").text) if job.find("./passed") is not None else 0,
                    "failed": int(job.find("./failed").text) if job.find("./failed") is not None else 0,
                    "skipped": int(job.find("./skipped").text) if job.find("./skipped") is not None else 0,
                    "fail_reason": job.find("./fail_reason").text if job.find("./fail_reason") is not None else "",
                    "concurrent_users": job.find("./concurrent_users").text if job.find("./concurrent_users") is not None else "",
                    "avg_response_time": job.find("./avg_response_time").text if job.find("./avg_response_time") is not None else ""
                }
                jobs.append(job_data)
        except Exception as e:
            print(f"加载测试任务数据时出错: {str(e)}")
        
        # 加载测试脚本数据
        scripts = []
        try:
            tree, root = parse_xml_file(os.path.join("data", "testscript.xml"))
            for script in root.findall("./script"):
                script_data = {
                    "id": script.get("id"),
                    "name": script.get("name"),
                    "type": script.get("type"),
                    "description": script.find("./description").text if script.find("./description") is not None else "",
                    "author": script.find("./author").text if script.find("./author") is not None else "",
                    "last_modified": script.find("./last_modified").text if script.find("./last_modified") is not None else "",
                    "status": script.find("./status").text if script.find("./status") is not None else "",
                    "framework": script.find("./framework").text if script.find("./framework") is not None else "",
                    "language": script.find("./language").text if script.find("./language") is not None else "",
                    "version": script.find("./version").text if script.find("./version") is not None else "",
                    "tags": script.find("./tags").text if script.find("./tags") is not None else "",
                    "pass_rate": script.find("./pass_rate").text if script.find("./pass_rate") is not None else "",
                    "execution_time": script.find("./execution_time").text if script.find("./execution_time") is not None else ""
                }
                scripts.append(script_data)
        except Exception as e:
            print(f"加载测试脚本数据时出错: {str(e)}")
        
        return {
            "success": True, 
            "message": "页面数据加载成功", 
            "data": {
                "test_cases": test_cases,
                "jobs": jobs,
                "scripts": scripts
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"加载页面数据失败: {str(e)}")

@app.post("/upload_script", summary="上传测试脚本")
async def upload_script(script_file: UploadFile = File(...)):
    try:
        if not script_file.filename:
            raise HTTPException(status_code=400, detail="文件名不能为空")
        
        # 获取文件扩展名并验证
        extension = script_file.filename.split(".")[-1].lower()
        valid_extensions = ['py', 'js', 'java', 'go', 'ts', 'rb', 'php', 'sh', 'bat', 'cmd', 'yaml', 'yml', 'json', 'xml', 'spec.js', 'test.js']
        if extension not in valid_extensions:
            raise HTTPException(status_code=400, detail=f"不支持的文件类型: .{extension}")
        
        # 推断脚本类型
        script_type = "其他测试"
        if extension in ['py', 'js', 'spec.js', 'test.js', 'ts']:
            script_type = "Web自动化"
        elif extension in ['java', 'rb', 'php']:
            script_type = "API测试"
        elif extension in ['yaml', 'yml', 'json', 'xml']:
            script_type = "移动端测试"
        
        # 生成唯一ID和保存路径
        script_id = f"SCRIPT-{uuid.uuid4().hex[:8].upper()}"
        scripts_dir = os.path.join("data", "scripts")
        os.makedirs(scripts_dir, exist_ok=True)
        save_path = os.path.join(scripts_dir, script_file.filename)
        
        # 保存文件
        with open(save_path, "wb") as buffer:
            buffer.write(await script_file.read())
        
        # 更新XML文件
        xml_file_path = os.path.join("data", "testscript.xml")
        try:
            tree, root = parse_xml_file(xml_file_path)
        except HTTPException as e:
            # 如果文件不存在，创建新的XML结构
            if "文件不存在" in str(e):
                root = ET.Element("scripts")
                tree = ET.ElementTree(root)
            else:
                raise e
        
        # 创建新脚本元素
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        script_elem = ET.SubElement(root, "script")
        script_elem.set("id", script_id)
        script_elem.set("name", script_file.filename)
        script_elem.set("type", script_type)
        
        # 添加子元素
        ET.SubElement(script_elem, "description").text = f"上传的{script_type}测试脚本"
        ET.SubElement(script_elem, "author").text = "上传用户"
        ET.SubElement(script_elem, "last_modified").text = now
        ET.SubElement(script_elem, "status").text = "开发中"
        ET.SubElement(script_elem, "framework").text = "未知"
        ET.SubElement(script_elem, "language").text = extension.upper()
        ET.SubElement(script_elem, "version").text = "1.0.0"
        ET.SubElement(script_elem, "tags").text = "上传脚本"
        ET.SubElement(script_elem, "pass_rate").text = "0%"
        ET.SubElement(script_elem, "execution_time").text = "未知"
        
        # 保存XML
        tree.write(xml_file_path, encoding="UTF-8", xml_declaration=True)
        
        return {"success": True, "message": f"脚本 {script_file.filename} 上传成功", "data": {"script_id": script_id, "script_name": script_file.filename, "script_type": script_type, "save_path": save_path}}
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "message": f"上传脚本失败: {str(e)}"})

class RunScriptRequest(BaseModel):
    script_id: str

@app.post("/run_test_script", summary="执行测试脚本")
async def run_test_script(request: RunScriptRequest):
    try:
        # 查找脚本
        xml_file_path = os.path.join("data", "testscript.xml")
        tree, root = parse_xml_file(xml_file_path)
        
        script_elem = None
        for script in root.findall("./script"):
            if script.get("id") == request.script_id:
                script_elem = script
                break
        
        if not script_elem:
            raise HTTPException(status_code=404, detail=f"未找到ID为{request.script_id}的测试脚本")
        
        # 确定执行命令
        script_name = script_elem.get("name")
        script_path = os.path.join("data", "scripts", script_name)
        
        if not os.path.exists(script_path):
            raise HTTPException(status_code=404, detail=f"测试脚本文件{script_name}不存在")
        
        # 根据文件类型选择执行命令
        if script_name.endswith(".py"):
            command = ["python", os.path.abspath(script_path)]
        elif script_name.endswith(".js"):
            command = ["node", os.path.abspath(script_path)]
        elif script_name.endswith(".java"):
            # Java文件需要编译
            class_name = script_name.rsplit(".", 1)[0]
            compile_cmd = ["javac", os.path.abspath(script_path)]
            compile_result = subprocess.run(compile_cmd, capture_output=True, text=True)
            if compile_result.returncode != 0:
                return {"success": False, "message": "Java文件编译失败", "data": {"stderr": compile_result.stderr}}
            command = ["java", class_name]
        else:
            command = ["python", os.path.abspath(script_path)]
        
        # 执行脚本
        try:
            result = subprocess.run(command, capture_output=True, text=True, timeout=30)
            
            # 更新脚本状态
            script_elem.find("./last_modified").text = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            if result.returncode == 0:
                script_elem.find("./status").text = "已验证"
                script_elem.find("./pass_rate").text = "100%"
            else:
                script_elem.find("./status").text = "需更新"
                script_elem.find("./pass_rate").text = "0%"
            
            tree.write(xml_file_path, encoding="UTF-8", xml_declaration=True)
            
            return {
                "success": result.returncode == 0,
                "message": f"脚本{script_name}执行{'成功' if result.returncode == 0 else '失败'}",
                "data": {
                    "script_id": request.script_id,
                    "script_name": script_name,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "return_code": result.returncode,
                    "command": command,
                    "script_path": script_path
                }
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "message": "脚本执行超时", "data": {"error": "脚本执行超时", "command": command, "script_path": script_path}}
        except Exception as e:
            return {"success": False, "message": "脚本执行异常", "data": {"error": str(e), "command": command, "script_path": script_path}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"执行脚本时发生错误: {str(e)}")
    



# ------------------- testscript.xml 脚本管理接口 -------------------
from fastapi import Body
from typing import Optional
TESTSCRIPT_PATH=os.path.join("./data", "testscript.xml")
# 修改脚本
@app.put("/scripts/{script_id}", summary="修改测试脚本")
def update_script(script_id: str, data: dict = Body(...)):
    tree = ET.parse(TESTSCRIPT_PATH)
    root = tree.getroot()
    s = root.find(f"script[@id='{script_id}']")
    if s is None:
        raise HTTPException(404, "未找到该脚本")
    for key, value in data.items():
        if key in s.attrib:
            s.set(key, value)
        else:
            child = s.find(key)
            if child is not None:
                child.text = value
    tree.write(TESTSCRIPT_PATH, encoding="utf-8", xml_declaration=True)
    return {"msg": "修改成功"}





# 删除脚本
from fastapi import Body
@app.delete("/scripts/delete", summary="删除测试脚本（JSON入参，case_id）")
def delete_script(data: dict = Body(...)):
    script_id = data.get("case_id")
    if not script_id:
        raise HTTPException(400, "缺少case_id参数")
    tree = ET.parse(TESTSCRIPT_PATH)
    root = tree.getroot()
    s = root.find(f"script[@id='{script_id}']")
    if s is None:
        raise HTTPException(404, "未找到该脚本")
    # 获取脚本文件名（name属性）
    script_name = s.get("name")

    root.remove(s)
    tree.write(TESTSCRIPT_PATH, encoding="utf-8", xml_declaration=True)

    # 删除 data/scripts 目录下对应的用例文件（按 name 属性）
    script_dir = os.path.join(os.path.dirname(TESTSCRIPT_PATH), "scripts")
    script_file = os.path.join(script_dir, script_name) if script_name else None
    file_msg = ""
    if script_file and os.path.exists(script_file):
        os.remove(script_file)
        file_msg = f"，用例文件（{script_name}）已删除"
    elif script_file:
        file_msg = f"，用例文件（{script_name}）已不存在"

    return {"msg": f"删除成功{file_msg}"}

@app.get("/get_report_files", summary="获取测试脚本报告文件列表")
async def get_report_files():
    try:
        # 获取当前目录下所有test_script_report_*.txt文件
        report_files = []
        current_dir = os.path.dirname(os.path.abspath(__file__))

        # 遍历当前目录查找匹配的文件
        for filename in os.listdir(current_dir):
            if filename.startswith("test_script_report_") and filename.endswith(".txt"):
                # 获取文件信息
                file_path = os.path.join(current_dir, filename)
                file_stats = os.stat(file_path)

                # 添加文件信息到列表
                report_files.append({
                    "filename": filename,
                    "size": file_stats.st_size,
                    "mtime": datetime.fromtimestamp(file_stats.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
                })

        # 按修改时间排序（最新的在前）
        report_files.sort(key=lambda x: x["mtime"], reverse=True)

        return {"success": True, "message": "获取报告文件列表成功", "data": report_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取报告文件列表失败: {str(e)}")


@app.get("/get_report_content", summary="获取测试脚本报告文件内容")
async def get_report_content(filename: str):
    try:
        if not filename.startswith("test_script_report_") or not filename.endswith(".txt"):
            raise HTTPException(status_code=400, detail="无效的报告文件名")

        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"报告文件 {filename} 不存在")

        # 读取文件内容
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        return {"success": True, "message": "获取报告文件内容成功", "data": {"filename": filename, "content": content}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"读取报告文件内容失败: {str(e)}")




# 挂载静态文件目录到/static路径
static_directory = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=static_directory), name="static")

if __name__ == "__main__":
    # 启动应用，此时所有API路由已经注册
    uvicorn.run(app, host="0.0.0.0", port=8000)