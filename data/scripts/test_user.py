import requests
import pytest,os
import random
BASE_URL=os.getenv('base_url')
COOOKIE={"Cookie":"JSESSIONID=152C53A59E33E00B618027C19BE59BED"}

# 打印登录信息
def test_login(get_token_data):
    pass

#修改用户信息
def test_updata_user():

    url=os.getenv("base_url")+"/roncoo-pay-web-boss/pms/operator/edit"
    data={
        "navTabId":"czygl",
        "callbackType":"closeCurrent",
        "id":'2',
        "selectVal":"",
        "realName":'vivy',
        "loginName":"guest",
        "mobileNo":"18926215592",
        "remark":"%E6%B8%B8%E5%AE%A2asd",
        "selectRole":"3"
    }
    
    res=requests.post(url,data=data,headers=COOOKIE)
    print(res.text)


"""用户信息修改接口测试类"""

# ------------------------------ 正向测试用例 ------------------------------
#@pytest.mark.positive
def test_update_all_valid_fields():
    """正向：正常修改用户所有字段（全量合法参数）"""
    # 1. 测试数据（全量合法字段）
    url = f"{BASE_URL}/roncoo-pay-web-boss/pms/operator/edit"
    update_data = {
        "navTabId": "czygl",
        "callbackType": "closeCurrent",
        "id": "2",  # 前提：系统中存在ID=2的用户
        "selectVal": "",
        "realName": "NewVivy_2024",  # 新姓名（合法格式）
        "loginName": "new_guest_001",  # 新登录名（不重复）
        "mobileNo": "13812345678",  # 新手机号（合法格式）
        "remark": "正向测试：全量修改用户信息",  # 新备注
        "selectRole": "3"  # 合法角色ID（前提：角色3存在）
    }

    # 2. 发送请求
    res = requests.post(url, data=update_data, headers={"Cookie": COOOKIE})
    res_json = res.json()  # 假设接口返回JSON格式（若为HTML可调整解析方式）

    # 3. 断言预期结果
    assert res.status_code == 200, f"接口状态码异常：{res.status_code}"
    assert res_json.get("status") == "success", f"接口返回失败：{res.text}"  # 假设成功标识为"success"
    # （可选）若有查询接口，可追加断言：查询用户ID=2的信息，确认字段已更新
    # query_res = requests.get(f"{BASE_URL}/query/user?id=2", headers={"Cookie": COOOKIE})
    # assert query_res.json().get("realName") == "NewVivy_2024", "姓名未更新"

# @pytest.mark.positive
def test_update_partial_fields():
    """正向：仅修改用户部分字段（非全量参数，保留部分原字段）"""
    # 1. 测试数据（仅修改手机号和备注，其他字段留空/保持原值）
    url = f"{BASE_URL}/roncoo-pay-web-boss/pms/operator/edit"
    update_data = {
        "navTabId": "czygl",
        "callbackType": "closeCurrent",
        "id": "2",  # 存在的用户ID
        "selectVal": "",
        "realName": "",  # 不修改姓名（留空）
        "loginName": "",  # 不修改登录名（留空）
        "mobileNo": "13987654321",  # 仅修改手机号
        "remark": "正向测试：仅修改部分字段",  # 仅修改备注
        "selectRole": "3"  # 保持原角色
    }

    # 2. 发送请求
    res = requests.post(url, data=update_data, headers={"Cookie": COOOKIE})
    res_json = res.json()

    # 3. 断言预期结果
    assert res.status_code == 200, f"接口状态码异常：{res.status_code}"
    assert res_json.get("status") == "success", f"接口返回失败：{res.text}"
    # （可选）查询断言：仅手机号和备注更新，姓名、登录名保持原值
    # query_res = requests.get(f"{BASE_URL}/query/user?id=2", headers={"Cookie": COOOKIE})
    # assert query_res.json().get("mobileNo") == "13987654321", "手机号未更新"
    # assert query_res.json().get("realName") == "原姓名", "姓名不应被修改"


# ------------------------------ 反向测试用例 ------------------------------
# @pytest.mark.negative
def test_update_non_existent_user():
    """反向：修改不存在的用户（ID无效）"""
    # 1. 测试数据（ID=9999为不存在的用户）
    url = f"{BASE_URL}/roncoo-pay-web-boss/pms/operator/edit"
    update_data = {
        "navTabId": "czygl",
        "callbackType": "closeCurrent",
        "id": "9999",  # 无效用户ID
        "selectVal": "",
        "realName": "InvalidUser",
        "loginName": "invalid_guest",
        "mobileNo": "13800000000",
        "remark": "反向测试：修改不存在的用户",
        "selectRole": "3"
    }

    # 2. 发送请求
    res = requests.post(url, data=update_data, headers={"Cookie": COOOKIE})
    res_json = res.json()

    # 3. 断言预期结果
    # assert res.status_code in [400, 404], f"状态码异常：{res.status_code}（预期400/404）"
    # assert res_json.get("status") == "error", f"接口未返回错误标识：{res.text}"
    # assert "用户不存在" in res_json.get("message", ""), f"错误提示不符：{res.text}"  # 断言错误信息


#@pytest.mark.negative
def test_update_duplicate_login_name():
    """反向：修改登录名为已存在的值（登录名唯一校验）"""
    # 前提：系统中已有登录名"admin"的用户
    # 1. 测试数据（loginName=admin，已存在）
    url = f"{BASE_URL}/roncoo-pay-web-boss/pms/operator/edit"
    update_data = {
        "navTabId": "czygl",
        "callbackType": "closeCurrent",
        "id": "2",  # 存在的用户ID
        "selectVal": "",
        "realName": "Vivy",
        "loginName": "admin",  # 已存在的登录名
        "mobileNo": "18926215592",
        "remark": "反向测试：登录名重复",
        "selectRole": "3"
    }

    # 2. 发送请求
    res = requests.post(url, data=update_data, headers={"Cookie": COOOKIE})
    res_json = res.json()

    # 3. 断言预期结果
   


#@pytest.mark.negative
def test_update_with_invalid_cookie():
    """反向：使用无效Cookie（未登录/登录过期）修改用户"""
    # 1. 测试数据（Cookie为无效值）
    url = f"{BASE_URL}/roncoo-pay-web-boss/pms/operator/edit"
    update_data = {
        "navTabId": "czygl",
        "callbackType": "closeCurrent",
        "id": "2",
        "selectVal": "",
        "realName": "Vivy",
        "loginName": "guest",
        "mobileNo": "18926215592",
        "remark": "反向测试：无效Cookie",
        "selectRole": "3"
    }
    invalid_cookie = "invalid_session_id=123456"  # 无效Cookie

    # 2. 发送请求
    res = requests.post(url, data=update_data, headers={"Cookie": invalid_cookie})

    # 3. 断言预期结果
    assert res.status_code in [401, 302], f"状态码异常：{res.status_code}（预期401/302）"
    # 若接口返回登录跳转或未授权提示，可追加断言
    assert "未登录" in res.text or "登录过期" in res.text or res.url.endswith("/login"), f"未触发登录校验：{res.text}"


# ------------------------------ 边界测试用例 ------------------------------
#@pytest.mark.boundary
def test_update_mobile_no_boundary():
    """边界：手机号为11位极限值（最小13000000000，最大19999999999）"""
    # 1. 测试数据（手机号为11位合法边界值）
    url = f"{BASE_URL}/roncoo-pay-web-boss/pms/operator/edit"
    # 测试两组边界值：最小合法手机号、最大合法手机号
    boundary_mobiles = ["13000000000", "19999999999"]
    for mobile in boundary_mobiles:
        update_data = {
            "navTabId": "czygl",
            "callbackType": "closeCurrent",
            "id": "2",
            "selectVal": "",
            "realName": "Vivy",
            "loginName": "guest",
            "mobileNo": mobile,  # 边界手机号
            "remark": f"边界测试：手机号{mobile}",
            "selectRole": "3"
        }
        # 发送请求
        res = requests.post(url, data=update_data, headers={"Cookie": COOOKIE})
        res_json = res.json()
        # 断言
        assert res.status_code == 200, f"手机号{mobile}状态码异常：{res.status_code}"
        assert res_json.get("status") == "success", f"手机号{mobile}修改失败：{res.text}"


#@pytest.mark.boundary
def test_update_remark_max_length():
    """边界：备注字段达到最大长度限制（假设最大200字符）"""
    # 1. 测试数据（备注为200个字符的字符串）
    url = f"{BASE_URL}/roncoo-pay-web-boss/pms/operator/edit"
    max_length_remark = "a" * 200  # 假设备注最大长度为200字符
    update_data = {
        "navTabId": "czygl",
        "callbackType": "closeCurrent",
        "id": "2",
        "selectVal": "",
        "realName": "Vivy",
        "loginName": "guest",
        "mobileNo": "18926215592",
        "remark": max_length_remark,  # 最大长度备注
        "selectRole": "3"
    }

    # 2. 发送请求
    res = requests.post(url, data=update_data, headers={"Cookie": COOOKIE})
    res_json = res.json()

    # 3. 断言预期结果
    assert res.status_code == 200, f"备注最大长度状态码异常：{res.status_code}"
    assert res_json.get("status") == "success", f"备注最大长度修改失败：{res.text}"
    # （可选）查询断言：备注字段完整保存200字符
    # query_res = requests.get(f"{BASE_URL}/query/user?id=2", headers={"Cookie": COOOKIE})
    # assert len(query_res.json().get("remark")) == 200, "备注最大长度未保存完整"


#@pytest.mark.boundary
def test_update_remark_exceed_max_length():
    """边界：备注字段超过最大长度限制（假设最大200字符，传入201字符）"""
    # 1. 测试数据（备注为201个字符的字符串）
    url = f"{BASE_URL}/roncoo-pay-web-boss/pms/operator/edit"
    exceed_remark = "a" * 201  # 超过最大长度的备注
    update_data = {
        "navTabId": "czygl",
        "callbackType": "closeCurrent",
        "id": "2",
        "selectVal": "",
        "realName": "Vivy",
        "loginName": "guest",
        "mobileNo": "18926215592",
        "remark": exceed_remark,  # 超长度备注
        "selectRole": "3"
    }

    # 2. 发送请求
    res = requests.post(url, data=update_data, headers={"Cookie": COOOKIE})
    res_json = res.json()

    # 3. 断言预期结果
    assert res.status_code == 400, f"超长度备注状态码异常：{res.status_code}（预期400）"
    assert res_json.get("status") == "error", f"超长度备注未返回错误：{res.text}"
    assert "备注长度超过限制" in res_json.get("message", ""), f"超长度错误提示不符：{res.text}"


#@pytest.mark.boundary
def test_update_id_boundary():
    """边界：用户ID为最小有效整数（如ID=1）和最大常见整数（如ID=10000）"""
    # 前提：系统中存在ID=1和ID=10000的用户
    url = f"{BASE_URL}/roncoo-pay-web-boss/pms/operator/edit"
    boundary_ids = ["1", "10000"]  # 边界ID（根据实际系统调整）
    for user_id in boundary_ids:
        update_data = {
            "navTabId": "czygl",
            "callbackType": "closeCurrent",
            "id": user_id,  # 边界ID
            "selectVal": "",
            "realName": f"User_{user_id}",
            "loginName": f"guest_{user_id}",
            "mobileNo": "18926215592",
            "remark": f"边界测试：用户ID={user_id}",
            "selectRole": "3"
        }
        # 发送请求
        res = requests.post(url, data=update_data, headers={"Cookie": COOOKIE})
        res_json = res.json()
        # 断言
        assert res.status_code == 200, f"ID={user_id}状态码异常：{res.status_code}"
        assert res_json.get("status") == "success", f"ID={user_id}修改失败：{res.text}"




def test_add_user():
    url=os.getenv("base_url")+"roncoo-pay-web-boss/pms/operator/add"
    user_name='vivy'+str(random.randint(1,1000))
    print(user_name)
    data={
        "navTabId":"czygl",
        "callbackType":"closeCurrent",
        "id":'2',
        "selectVal":"3",
        "realName":user_name,
        "loginName":user_name+"@qq.com",
        "loginPwd":"123456",
        "mobileNo":"13233797161",
        "status":"ACTIVE",
        "remark":"天天开心",
        "selectRole":"3"
    }
    res=requests.post(url,data=data,headers=COOOKIE)

    print(res.text)


# 查询指定用户
def test_find_user():
    url=os.getenv('base_url')+'/roncoo-pay-web-boss/account/list'
    data={
        'accountNo':"91966399435286188035"
    }
    res=requests.post(url=url,data=data,headers=COOOKIE)
    print(res.text)
