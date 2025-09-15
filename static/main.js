// DOM元素交互和初始化
function initDOMInteractions() {
    
    // 树节点切换
    document.querySelectorAll('.tree-node .toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const node = this.closest('.tree-node');
            const icon = this.querySelector('i');
            
            node.classList.toggle('expanded');
            if (node.classList.contains('expanded')) {
                icon.classList.replace('fa-chevron-right', 'fa-chevron-down');
            } else {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-right');
            }
        });
    });

    // 树节点选择
    document.querySelectorAll('.tree-node').forEach(node => {
        node.addEventListener('click', function(e) {
            if (e.target.classList.contains('toggle')) return;
            
            document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 选项卡切换
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 菜单项选择
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 按钮悬停效果
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-2px)'; });
        btn.addEventListener('mouseleave', function() { this.style.transform = 'translateY(0)'; });
    });
    // ...existing code...
document.addEventListener('DOMContentLoaded', function() {
    initDOMInteractions();

    // 菜单点击切换内容区
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有菜单的active
            document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');

            // 如果点击的是“用例管理”
            if (this.getAttribute('data-menu') === 'testcase') {
                // 滚动到用例管理卡片
                const testcaseCard = document.querySelector('.card .card-title:contains("用例管理")');
                if (testcaseCard) {
                    testcaseCard.parentElement.parentElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ...原有的延迟加载等代码...
    setTimeout(() => {
        loadPage();
    }, 500);

    setTimeout(initUploadScriptFunctionality, 600);
});
// ...existing code...
}

// 统一API请求函数
async function fetchAPI(endpoint, method = 'GET', data = null) {
    try {
        const options = { method, headers: {} };
        if ((method === 'POST' || method === 'PUT') && data && !(data instanceof FormData)) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        } else if ((method === 'POST' || method === 'PUT') && data) {
            options.body = data;
        }
        
        const response = await fetch(`http://localhost:8000${endpoint}`, options);
        if (!response.ok) throw new Error('接口请求失败');
        return await response.json();
    } catch (error) {
        console.error(`API请求失败 [${endpoint}]:`, error);
        throw error;
    }
}

// 渲染测试用例数据
function renderTestCases(testCases) {
    const testCaseContainer = document.getElementById('test-case-container');
    if (!testCaseContainer) return;
    
    testCaseContainer.innerHTML = '';
    const testCaseList = document.createElement('div');
    testCaseList.className = 'test-case-list';
    
    testCases.forEach(testCase => {
        const testCaseCard = document.createElement('div');
        testCaseCard.className = 'test-case-card';
        testCaseCard.dataset.id = testCase.id;
        
        testCaseCard.innerHTML = `
            <div class="test-case-header">
                <h3>${testCase.name}</h3>
                <span class="test-case-id">ID: ${testCase.id}</span>
            </div>
            <div class="test-case-actions">
                <button class="btn btn-view" onclick="window.viewTestCase('${testCase.id}')">查看详情</button>
                <button class="btn btn-run" onclick="window.runTestCase('${testCase.id}')">运行测试</button>
            </div>
        `;
        
        testCaseList.appendChild(testCaseCard);
    });
    
    testCaseContainer.appendChild(testCaseList);
}

// 渲染测试任务数据
function renderJobs(jobs) {
    const jobContainer = document.getElementById('job-container');
    if (!jobContainer) return;
    
    jobContainer.innerHTML = '';
    const jobList = document.createElement('div');
    jobList.className = 'job-list';
    
    jobs.forEach(job => {
        // 获取状态样式类
        const getStatusClass = (status) => {
            switch(status) {
                case '成功': return 'status-success';
                case '失败': return 'status-danger';
                case '部分成功': return 'status-warning';
                default: return 'status-info';
            }
        };
        
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.dataset.id = job.id;
        
        jobCard.innerHTML = `
            <div class="job-header">
                <h3>${job.name}</h3>
                <span class="job-id">ID: ${job.id}</span>
            </div>
            <div class="job-info">
                <div class="job-status">
                    <span class="status-badge ${getStatusClass(job.status)}">${job.status}</span>
                </div>
                <div class="job-time">
                    <span class="start-time">开始: ${job.start_time}</span>
                    <span class="duration">耗时: ${job.duration}</span>
                </div>
            </div>
            <div class="job-stats">
                <div class="stat-item">
                    <span class="stat-label">通过:</span>
                    <span class="stat-value passed">${job.passed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">失败:</span>
                    <span class="stat-value failed">${job.failed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">跳过:</span>
                    <span class="stat-value skipped">${job.skipped}</span>
                </div>
            </div>
            <div class="job-actions">
                <button class="btn btn-view" onclick="window.viewJob('${job.id}')">查看详情</button>
                <button class="btn btn-run" onclick="window.rerun('${job.id}')">Rerun</button>
            </div>
        `;
        
        jobList.appendChild(jobCard);
    });
    
    jobContainer.appendChild(jobList);
}

// 渲染测试脚本数据到表格
function renderTestScripts(scripts) {
    const tableBody = document.querySelector('.table-responsive table tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    scripts.forEach(script => {
        // 获取状态样式类
        const getStatusClass = (status) => {
            switch(status) {
                case '已验证': return 'status-success';
                case '需更新': return 'status-warning';
                case '开发中': return 'status-info';
                default: return 'status-default';
            }
        };
        
        // 提取日期部分
        const date = script.last_modified && script.last_modified.length > 10 ? script.last_modified.substring(0, 10) : script.last_modified;
        
        const row = document.createElement('tr');
        row.dataset.id = script.id;
        row.dataset.type = script.type;
  // ...existing code...
window.updataTestScript = function(scriptID, buttonElement) {
    // 创建弹窗
    let modal = document.getElementById('editScriptModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editScriptModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 99999;
        `;
        modal.innerHTML = `
            <div style="background:#fff; padding:32px 24px; border-radius:8px; min-width:320px; box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                <h4 style="margin-bottom:16px;">修改脚本信息</h4>
                <form id="editScriptForm">
                    <div style="margin-bottom:12px;">
                        <label>脚本名称：</label>
                        <input type="text" name="name" style="width:90%;" required>
                    </div>
                    <div style="margin-bottom:12px;">
                        <label>描述：</label>
                        <input type="text" name="description" style="width:90%;">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label>作者：</label>
                        <input type="text" name="author" style="width:90%;">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label>状态：</label>
                        <input type="text" name="status" style="width:90%;">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label>标签：</label>
                        <input type="text" name="tags" style="width:90%;">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label>版本：</label>
                        <input type="text" name="version" style="width:90%;">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label>框架：</label>
                        <input type="text" name="framework" style="width:90%;">
                    </div>
                    <div style="margin-bottom:12px;">
                        <label>语言：</label>
                        <input type="text" name="language" style="width:90%;">
                    </div>
                    <div style="text-align:right;">
                        <button type="submit" class="btn btn-primary">保存</button>
                        <button type="button" class="btn btn-secondary" id="closeEditScriptModal">取消</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';

    // 关闭按钮
    modal.querySelector('#closeEditScriptModal').onclick = function() {
        modal.style.display = 'none';
    };

    // 提交表单时弹窗显示所有要修改的数据
    modal.querySelector('#editScriptForm').onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {};
        formData.forEach((v, k) => { if (v) data[k] = v; });

        // 展示所有要修改的数据
        let msg = '本次修改内容：\n';
        Object.entries(data).forEach(([key, value]) => {
            msg += `${key}: ${value}\n`;
        });
        alert(msg);

        try {
            const resp = await fetchAPI(`/update_test_script/${scriptID}`, 'PUT', data);
            if (resp.success) {
                alert('修改成功！');
                modal.style.display = 'none';
                refreshTestScripts();
            } else {
                alert('修改失败：' + (resp.message || '未知错误'));
            }
        } catch (err) {
            alert('请求失败：' + err.message);
        }
    };
};
// ...existing code...

        row.innerHTML = `
            <td>${script.name}</td>
            <td>${script.type}</td>
            <td>${date}</td>
            <td><span class="status-badge ${getStatusClass(script.status)}">${script.status}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="window.runTestScript(event, '${script.id}')">
                    <i class="fas fa-play"></i>
                </button>

                <button class="btn btn-outline btn-sm" onclick="window.updataTestScript('${script.id}')">
                    <i class="fas fa-edit"></i>
                </button>

                <button class="btn btn-outline btn-sm" onclick="window.deleteTestScript('${script.id}', this)">
                <i class="fas fa-trash-alt"></i>
                </button>

            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    initScriptTabs();
}

// 1. 给所有删除按钮绑定点击事件
document.querySelectorAll('.delete-btn').forEach(btn => {
  btn.addEventListener('click', async function() {
    // 2. 1. 获取要删除的目标ID（从 data-id 属性中）
    const deleteId = this.getAttribute('data-id');
    console.log('要删除的ID：', deleteId); // 输出：SCRIPT-62B4ADC1

    // 2. 2. （关键）请求后端接口删除数据（用 fetch/axios 发送请求）
    try {
      // 确认用户是否删除（避免误操作）
      if (!confirm('确定要删除吗？删除后不可恢复！')) return;

      // 发送 DELETE 请求到后端（替换为你的真实接口地址）
      const response = await fetch(`http://localhost:8000/scripts/${id}`, {
        method: 'DELETE', // 请求方法：DELETE（符合RESTful规范）
        headers: {
          'Content-Type': 'application/json',
          // 若需要登录验证，添加 Token（如：Authorization: 'Bearer ' + token）
        }
      });

      // 2. 3. 处理接口响应
      const result = await response.json();
      if (result.success) {
        alert('删除成功！');
        // 3. 页面同步更新：删除按钮所在的DOM元素（如父容器）
        this.parentElement.remove(); // 根据你的DOM结构调整（如删除整行数据）
      } else {
        alert('删除失败：' + result.message);
      }
    } catch (error) {
      console.error('删除请求出错：', error);
      alert('网络错误，请重试！');
    }
  });
});
// 初始化脚本管理的选项卡功能
function initScriptTabs() {
    const tabs = document.querySelectorAll('.tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterScriptsByType(this.textContent.trim());
        });
    });
}

// 根据类型过滤脚本
function filterScriptsByType(type) {
    document.querySelectorAll('.table-responsive table tbody tr').forEach(row => {
        row.style.display = type === '所有脚本' || row.dataset.type === type ? '' : 'none';
    });
}

// 显示上传状态消息
function showUploadStatus(message, isSuccess = true) {
    // 移除已存在的状态消息，避免重叠显示
    document.querySelectorAll('.upload-status').forEach(el => el.remove());
    
    const statusElement = document.createElement('div');
    statusElement.className = `upload-status ${isSuccess ? 'status-success' : 'status-error'}`;
    
    // 添加图标和消息内容
    const iconClass = isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle';
    statusElement.innerHTML = `
        <div class="upload-status-content">
            <i class="fas ${iconClass} upload-status-icon"></i>
            <span class="upload-status-text">${message}</span>
            <button class="upload-status-close">&times;</button>
        </div>
    `;
    
    // 添加样式
    statusElement.style.cssText = `
        position: fixed; top: 60px; right: 20px; padding: 0; 
        borderRadius: 8px; color: white; 
        background-color: ${isSuccess ? '#4CAF50' : '#f44336'};
        zIndex: 99999; boxShadow: 0 6px 12px rgba(0, 0, 0, 0.15); 
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0; transform: translateY(-20px);
        maxWidth: 400px;
        pointerEvents: auto;
        zIndex: 99999;
    `;
    
    // 添加内容样式
    const content = statusElement.querySelector('.upload-status-content');
    content.style.cssText = `
        display: flex; align-items: center; padding: 16px 24px;
    `;
    
    // 添加图标样式
    const icon = statusElement.querySelector('.upload-status-icon');
    icon.style.cssText = `
        font-size: 24px; margin-right: 12px;
        animation: pulse 1.5s infinite;
    `;
    
    // 添加文本样式
    const text = statusElement.querySelector('.upload-status-text');
    text.style.cssText = `
        flex: 1; font-size: 14px; font-weight: 500;
    `;
    
    // 添加关闭按钮样式
    const closeButton = statusElement.querySelector('.upload-status-close');
    closeButton.style.cssText = `
        background: none; border: none; color: white; 
        font-size: 20px; cursor: pointer; padding: 0; 
        width: 24px; height: 24px; display: flex; 
        align-items: center; justify-content: center;
        border-radius: 50%; transition: background-color 0.2s;
    `;
    
    closeButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    });
    
    closeButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
    
    closeButton.addEventListener('click', function() {
        statusElement.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(statusElement)) {
                document.body.removeChild(statusElement);
            }
        }, 300);
    });
    
    // 添加到页面
    document.body.appendChild(statusElement);
    
    // 触发动画显示
    setTimeout(() => {
        statusElement.style.opacity = '1';
        statusElement.style.transform = 'translateY(0)';
    }, 10);
    
    // 自动消失
    const timer = setTimeout(() => {
        if (document.body.contains(statusElement)) {
            statusElement.style.opacity = '0';
            statusElement.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (document.body.contains(statusElement)) {
                    document.body.removeChild(statusElement);
                }
            }, 300);
        }
    }, 5000); // 延长显示时间到5秒，让用户有足够时间看到
    
    // 添加点击消息也可以关闭
    statusElement.addEventListener('click', function(e) {
        if (e.target !== closeButton && !closeButton.contains(e.target)) {
            clearTimeout(timer);
            statusElement.style.opacity = '0';
            statusElement.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (document.body.contains(statusElement)) {
                    document.body.removeChild(statusElement);
                }
            }, 300);
        }
    });
    
    // 添加脉冲动画样式
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(styleSheet);
}

// 初始化上传脚本功能
function initUploadScriptFunctionality() {
    // 修正选择器，确保能正确找到上传按钮
    const uploadButton = document.querySelector('.card-header .btn-outline.btn-sm i.fas.fa-upload').parentElement;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // 限制文件类型
    const validExtensions = ['.py', '.js', '.java', '.go', '.ts', '.rb', '.php', '.sh', '.bat', '.cmd', '.yaml', '.yml', '.json', '.xml'];
    fileInput.accept = validExtensions.join(',');
    
    uploadButton.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) await handleScriptUpload(file);
    });
}

// 刷新测试脚本列表，避免整页重载
async function refreshTestScripts() {
    try {
        // 只更新脚本列表，不影响其他部分
        const tableBody = document.querySelector('.table-responsive table tbody');
        if (!tableBody) return;
        
        // 显示加载状态但不清除原有内容，减少闪烁感
        const loadingRow = document.createElement('tr');
        loadingRow.className = 'script-refresh-loading';
        loadingRow.innerHTML = '<td colspan="5" class="loading">更新中...</td>';
        tableBody.appendChild(loadingRow);
        
        // 调用统一的load_page接口获取脚本数据
        const response = await fetchAPI('/load_page');
        const data = response.data || {};
        
        // 移除加载行
        tableBody.removeChild(loadingRow);
        
        // 渲染测试脚本数据
        if (data.scripts && data.scripts.length > 0) {
            renderTestScripts(data.scripts);
        } else {
            tableBody.innerHTML = '<tr><td colspan="5" class="no-data">暂无测试脚本数据</td></tr>';
        }
    } catch (error) {
        console.error('刷新脚本列表失败:', error);
        // 错误处理保持轻量级，不影响用户体验
    }
}

// 处理脚本上传
async function handleScriptUpload(file) {
    showUploadStatus(`开始上传脚本: ${file.name}`);
    
    try {
        const formData = new FormData();
        formData.append('script_file', file);
        
        const result = await fetchAPI('/upload_script', 'POST', formData);
        
        if (result.success) {
            showUploadStatus(`脚本 ${file.name} 上传成功!`);
            // 只刷新脚本列表，不再重新加载整个页面
            refreshTestScripts();
        } else {
            showUploadStatus(result.message || '上传失败，请重试', false);
        }
    } catch (error) {
        showUploadStatus(`上传失败: ${error.message || '网络错误'}`, false);
        console.error('上传脚本时出错:', error);
    } finally {
        // 重置fileInput，确保第二次上传同一个文件时也能触发change事件
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    }
}

// 显示测试脚本执行结果
function showExecutionResult(result) {
    let resultModal = document.getElementById('executionResultModal');
    
    if (!resultModal) {
        resultModal = document.createElement('div');
        resultModal.id = 'executionResultModal';
        resultModal.className = 'modal fade';
        resultModal.setAttribute('tabindex', '-1');
        resultModal.setAttribute('role', 'dialog');
        resultModal.setAttribute('aria-labelledby', 'executionResultModalLabel');
        resultModal.setAttribute('aria-hidden', 'true');
        
        resultModal.innerHTML = `
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="executionResultModalLabel">测试脚本执行结果</h5>
                        <button type="button" class="close">×</button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary">关闭</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(resultModal);
        
        // 添加关闭事件监听
        resultModal.querySelector('.close, .btn-secondary').addEventListener('click', () => {
            resultModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    }
    
    // 更新结果内容
    const statusClass = result.return_code === 0 ? 'text-success' : 'text-danger';
    const statusText = result.return_code === 0 ? '成功' : '失败';
    
    resultModal.querySelector('.modal-body').innerHTML = `
        <div class="mb-3">
            <strong>脚本名称:</strong> ${result.script_name}
        </div>
        <div class="mb-3">
            <strong>执行状态:</strong> <span class="${statusClass}">${statusText}</span>
        </div>
        <div class="mb-3">
            <strong>返回码:</strong> ${result.return_code}
        </div>
        <div class="mb-3">
            <strong>标准输出:</strong>
            <pre class="bg-light p-2 mt-1 rounded overflow-auto" style="max-height: 200px;">${result.stdout || '无'}</pre>
        </div>
        <div class="mb-3">
            <strong>错误输出:</strong>
            <pre class="bg-light p-2 mt-1 rounded overflow-auto" style="max-height: 200px;">${result.stderr || '无'}</pre>
        </div>
    `;
    
    resultModal.style.display = 'block';
    document.body.classList.add('modal-open');
}

// 全局函数定义
window.viewJob = function(id) { alert(`查看测试任务 ID: ${id}`); };
window.rerun = function(id) { alert(`rerun ID: ${id}`); };
window.viewTestCase = function(id) { alert(`查看测试用例 ID: ${id}`); };
window.runTestCase = function(id) { alert(`调用Jenkins salve执行pytest运行测试用例 ID: ${id}`); };
window.editTestScript = function(id) { alert(`编辑测试脚本 ID: ${id}`); };
window.runTestScript = async function(event, id) {
    try {
        const button = event.target.closest('button');
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;
        
        const data = await fetchAPI('/run_test_script', 'POST', { script_id: id });
        
        button.innerHTML = originalContent;
        button.disabled = false;
        
        if (data.success) {
            showExecutionResult(data.data);
            // 执行成功后仅刷新脚本列表，避免页面闪烁
            refreshTestScripts();
        } else {
            alert(`脚本执行失败: ${data.message}`);
        }
    } catch (error) {
        alert(`执行测试脚本时发生错误: ${error.message}`);
        const button = event.target.closest('button');
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
};

// 加载所有页面数据的统一函数
async function loadPage() {
    try {
        // 显示加载状态
        const testCaseContainer = document.getElementById('test-case-container');
        const jobContainer = document.getElementById('job-container');
        const tableBody = document.querySelector('.table-responsive table tbody');
        
        if (testCaseContainer) {
            testCaseContainer.innerHTML = '<div class="loading">加载中...</div>';
        }
        if (jobContainer) {
            jobContainer.innerHTML = '<div class="loading">加载中...</div>';
        }
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" class="loading">加载中...</td></tr>';
        }
        
        // 调用统一的load_page接口
        const response = await fetchAPI('/load_page');
        
        // 从response.data中获取实际数据
        const data = response.data || {};
        
        // 渲染测试用例数据
        if (data.test_cases && data.test_cases.length > 0) {
            renderTestCases(data.test_cases);
        } else if (testCaseContainer) {
            testCaseContainer.innerHTML = '<div class="no-data">暂无测试用例数据</div>';
        }
        
        // 渲染测试任务数据
        if (data.jobs && data.jobs.length > 0) {
            renderJobs(data.jobs);
        } else if (jobContainer) {
            jobContainer.innerHTML = '<div class="no-data">暂无测试任务数据</div>';
        }
        
        // 渲染测试脚本数据
        if (data.scripts && data.scripts.length > 0) {
            renderTestScripts(data.scripts);
        } else if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" class="no-data">暂无测试脚本数据</td></tr>';
        }
    } catch (error) {
        // 显示错误状态
        const testCaseContainer = document.getElementById('test-case-container');
        const jobContainer = document.getElementById('job-container');
        const tableBody = document.querySelector('.table-responsive table tbody');
        
        if (testCaseContainer) {
            testCaseContainer.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
        }
        if (jobContainer) {
            jobContainer.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
        }
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" class="error">加载失败: ${error.message}</td></tr>`;
        }
        
        console.error('加载页面数据失败:', error);
    }
}

window.updataTestScript = function(scriptID,buttonElement){
    const isConfirmed=confirm(`修改${scriptID}`)
}




// 优化后的删除处理函数
window.deleteTestScript = function(scriptId, buttonElement) {
    // 1. 打印ID（带更详细的调试信息）
    console.log("开始处理删除操作，脚本ID：", scriptId);
    console.log("当前行数据：", buttonElement.closest('tr').dataset);
    
    // 2. 显示确认弹窗
    const isConfirmed = confirm(`确定要删除ID为 ${scriptId} 的脚本吗？此操作不可撤销。`);
    
    if (isConfirmed) {
        console.log("用户确认删除，准备调用接口...");
        
        // 禁用按钮防止重复点击
        buttonElement.disabled = true;
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // 3. 调用删除接口
        fetch(`/scripts/delete`, {  // 确保此URL正确
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // 根据你的后端要求添加认证信息
                // 'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            body: JSON.stringify({case_id:scriptId})
            // 有些后端可能需要CSRF令牌（特别是Django等框架）
            // credentials: 'include'
        })
        .then(response => {
            console.log("接口响应状态：", response.status);
            
            // 检查HTTP响应状态
            if (!response.ok) {
                throw new Error(`HTTP错误，状态码：${response.status}`);
            }
            
            // 处理不同的响应格式（有些接口成功时可能不返回JSON）
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            }
            return { success: true };
        })
        .then(data => {
            console.log("接口返回数据：", data);
            alert('删除成功！');
            
            // 移除当前行
            const row = buttonElement.closest('tr');
            if (row) {
                row.remove();
            }
        })
        .catch(error => {
            console.error('删除过程出错：', error);
            alert(`删除失败：${error.message}\n请检查控制台获取更多信息`);
            
            // 恢复按钮状态
            buttonElement.disabled = false;
            buttonElement.innerHTML = '<i class="fas fa-trash-alt"></i>';
        });
    } else {
        console.log("用户取消了删除操作");
    }
};

async function showReportList() {
    try {
        // 清空主内容区域
        const contentWrapper = document.querySelector('.content-wrapper');
        if (!contentWrapper) {
            console.error('未找到content-wrapper元素');
            return;
        }

        // 更新页面标题
        contentWrapper.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">测试脚本报告</h1>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-title">报告文件列表</div>
                </div>
                <div class="card-body">
                    <div id="report-list-container" class="loading">加载中...</div>
                </div>
            </div>
        `;

        // 获取报告文件列表
        const response = await fetchAPI('/get_report_files');
        const reportFiles = response.data || [];

        const reportListContainer = document.getElementById('report-list-container');
        if (!reportListContainer) return;

        if (reportFiles.length > 0) {
            // 创建报告文件列表
            let reportListHTML = `
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>文件名</th>
                                <th>大小 (字节)</th>
                                <th>修改时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            // 添加每个报告文件到列表
            reportFiles.forEach(file => {
                reportListHTML += `
                    <tr>
                        <td>${file.filename}</td>
                        <td>${file.size}</td>
                        <td>${file.mtime}</td>
                        <td>
                            <button class="btn btn-outline btn-sm btn-view-report" data-filename="${file.filename}">
                                <i class="fas fa-eye"></i> 查看
                            </button>
                        </td>
                    </tr>
                `;
            });

            reportListHTML += `
                        </tbody>
                    </table>
                </div>
            `;

            reportListContainer.innerHTML = reportListHTML;
            // 绑定查看按钮事件，确保点击后展示报告内容
            document.querySelectorAll('.btn-view-report').forEach(btn => {
                btn.addEventListener('click', function() {
                    const filename = this.getAttribute('data-filename');
                    window.viewReport(filename);
                });
            });
        } else {
            reportListContainer.innerHTML = '<div class="no-data">暂无测试脚本报告文件</div>';
        }
    } catch (error) {
        console.error('加载报告列表失败:', error);
        const reportListContainer = document.getElementById('report-list-container');
        if (reportListContainer) {
            reportListContainer.innerHTML = `<div class="error">加载失败: ${error.message}</div>`;
        }
    }
}






// 查看报告内容
window.viewReport = async function(filename) {
    try {
        // 创建模态框
        let reportModal = document.getElementById('reportModal');

        if (!reportModal) {
            reportModal = document.createElement('div');
            reportModal.id = 'reportModal';
            reportModal.className = 'modal fade';
            reportModal.setAttribute('tabindex', '-1');
            reportModal.setAttribute('role', 'dialog');
            reportModal.setAttribute('aria-labelledby', 'reportModalLabel');
            reportModal.setAttribute('aria-hidden', 'true');

            reportModal.innerHTML = `
                <div class="modal-dialog modal-lg" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="reportModalLabel">测试脚本报告</h5>
                            <button type="button" class="close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div id="report-content" class="loading">加载中...</div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary">关闭</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(reportModal);

            // 添加关闭事件监听
            reportModal.querySelector('.close, .btn-secondary').addEventListener('click', () => {
                reportModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }

        // 更新模态框标题
        reportModal.querySelector('.modal-title').textContent = `测试脚本报告: ${filename}`;

        // 获取报告内容
        const response = await fetchAPI(`/get_report_content?filename=${encodeURIComponent(filename)}`);
        const content = response.data.content || '';

        // 显示报告内容
        const reportContent = reportModal.querySelector('#report-content');
        if (reportContent) {
            // 对内容进行简单的格式化显示
            const formattedContent = content
                .replace(/\n/g, '<br>')  // 替换换行符为HTML换行标签
                .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');  // 替换制表符为四个空格

            reportContent.innerHTML = `<pre class="bg-light p-4 rounded overflow-auto" style="max-height: 500px; white-space: pre-wrap;">${formattedContent}</pre>`;
        }

        // 显示模态框，确保弹窗和遮罩层都出现
        reportModal.style.display = 'block';
        reportModal.style.position = 'fixed';
        reportModal.style.top = '50%';
        reportModal.style.left = '50%';
        reportModal.style.transform = 'translate(-50%, -50%)';
        reportModal.style.zIndex = '10000';
        reportModal.style.background = 'rgba(251, 246, 246, 0.97)';
        reportModal.style.width = 'auto';
        reportModal.style.maxWidth = '90vw';
        reportModal.style.maxHeight = '90vh';
        reportModal.style.overflow = 'auto';
        document.body.classList.add('modal-open');
        // 添加遮罩层
        let mask = document.getElementById('modalMask');
        if (!mask) {
            mask = document.createElement('div');
            mask.id = 'modalMask';
            mask.style.position = 'fixed';
            mask.style.top = '0';
            mask.style.left = '0';
            mask.style.width = '100vw';
            mask.style.height = '100vh';
            mask.style.background = 'rgba(104, 101, 101, 0.4)';
            mask.style.zIndex = '9999';
            document.body.appendChild(mask);
            mask.addEventListener('click', function() {
                reportModal.style.display = 'none';
                document.body.classList.remove('modal-open');
                mask.remove();
            });
        }
    } catch (error) {
        console.error('加载报告内容失败:', error);
        alert(`加载报告内容失败: ${error.message}`);
    }
};




// 页面初始化
// 在DOMContentLoaded事件处理程序中修改
document.addEventListener('DOMContentLoaded', function() {
    initDOMInteractions();

    // 修改选择器，使用更兼容的方式选择报告分析菜单项
    const menuItems = document.querySelectorAll('.menu-item');
    for (let i = 0; i < menuItems.length; i++) {
        const span = menuItems[i].querySelector('span');
        if (span && span.textContent.trim() === '报告分析') {
            menuItems[i].addEventListener('click', function() {
                // 移除其他菜单项的active类
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');

                // 显示报告列表
                showReportList();
            });
            break;
        }
    }

    // 延迟加载数据，确保页面元素已渲染完成
    setTimeout(() => {
        loadPage();
    }, 500);

    // 延迟初始化上传功能
    setTimeout(initUploadScriptFunctionality, 600);
});