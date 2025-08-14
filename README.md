# Augment Token Manager

一个基于 Tauri 构建的高性能跨平台桌面应用程序，专注于 Augment Code 访问令牌的生成、管理和安全存储。

> **致谢**: 本项目基于 [zhaochengcube/augment-token-mng](https://github.com/zhaochengcube/augment-token-mng) 进行深度优化和功能精简。感谢原作者的贡献！

![应用主界面](./1.png)

![Token管理界面](./2.png)

## ✨ 核心功能

### � OAuth 授权管理
- **一键生成授权URL**: 支持PKCE安全标准的OAuth 2.0流程
- **自动令牌获取**: 解析授权响应，自动提取访问令牌和租户信息
- **安全状态管理**: 内置状态验证，防止CSRF攻击

### 📊 Token 生命周期管理
- **安全存储**: 本地加密存储，支持多租户Token管理
- **实时状态检查**: 自动检测账户封禁状态和余额信息
- **Portal信息同步**: 获取账户余额、到期时间等详细信息
- **批量操作**: 支持编辑、删除、复制等批量管理功能

### 💾 数据管理与导出
- **本地数据存储**: 跨平台数据目录，支持一键打开数据文件夹
- **完整数据导出**: JSON格式导出所有Token和Portal信息
- **智能缓存系统**: API响应缓存，减少重复请求，提升性能

### ⚡ 性能优化特性
- **HTTP连接池**: 全局连接复用，减少50%连接时间
- **异步文件操作**: 非阻塞I/O，保持UI流畅响应
- **前端优化**: 代码分割和压缩，快速启动加载
- **零编译警告**: 生产就绪的代码质量

## 🚀 快速开始

### 📥 下载安装
- **Windows**: 下载 `.msi` 安装包（企业版）或 `.exe` 安装包（个人版）
- **macOS**: 下载 `.dmg` 安装包（支持Intel和Apple Silicon）

### 🔄 自动发布
每次代码提交都会自动构建和发布新版本，确保您始终获得最新功能和修复。

### 🛠️ 技术栈
- **前端**: Vue 3 + Vite + 响应式设计
- **后端**: Rust + Tauri 2.0 + 异步运行时
- **安全**: PKCE OAuth 2.0 + 本地加密存储
- **构建**: GitHub Actions 自动化CI/CD
- **平台**: Windows + macOS 跨平台支持

## 🔧 开发环境搭建

### 环境准备

1. **安装 Rust**：
   ```bash
   # Windows (PowerShell)
   Invoke-WebRequest -Uri https://win.rustup.rs/ -OutFile rustup-init.exe
   .\rustup-init.exe

   # macOS/Linux
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **安装 Node.js**：
   - 从 [nodejs.org](https://nodejs.org/) 下载安装 LTS 版本
   - 或使用包管理器：`winget install OpenJS.NodeJS`

3. **安装 Tauri CLI**：
   ```bash
   cargo install tauri-cli
   ```

### 快速构建（推荐）

#### Windows：
```powershell
cd augment-token-mng
.\build.ps1
```

#### macOS/Linux：
```bash
cd augment-token-mng
chmod +x build.sh
./build.sh
```

### 手动构建

#### 开发模式：
```bash
cd augment-token-mng
npm install          # 安装前端依赖
cargo tauri dev      # 启动开发服务器
```

#### 发布构建：
```bash
cd augment-token-mng
npm install          # 安装前端依赖
cargo tauri build    # 构建生产版本
```


## 📖 使用指南

### 🔐 获取访问令牌

1. **生成授权 URL**
   - 点击"生成 Augment 授权 URL"按钮
   - 系统自动生成符合PKCE标准的安全授权链接
   - 点击"打开授权 URL"在默认浏览器中打开

2. **完成 OAuth 授权**
   - 在浏览器中登录您的 Augment 账户
   - 完成授权确认流程
   - 复制浏览器返回的完整 JSON 响应

3. **获取访问令牌**
   - 将 JSON 响应粘贴到应用程序的文本区域
   - 点击"获取访问令牌"按钮
   - 系统自动解析并生成访问令牌和租户 URL

### 📊 Token 管理

4. **保存和管理 Token**
   - 点击"保存 Token"将当前令牌保存到本地
   - 可选添加邮箱备注和 Portal URL 信息
   - 点击"已保存 Token"查看所有保存的令牌

5. **高级管理功能**
   - **编辑**: 修改令牌信息、备注和 Portal 配置
   - **状态检查**: 实时检测账户封禁状态和余额
   - **Portal 同步**: 获取账户余额、到期时间等详细信息
   - **批量操作**: 复制、删除多个令牌

### 💾 数据管理

6. **数据存储位置**
   - **Windows**: `%APPDATA%\com.augment.token-manager\tokens.json`
   - **macOS**: `~/Library/Application Support/com.augment.token-manager/tokens.json`
   - **Linux**: `~/.local/share/com.augment.token-manager/tokens.json`

7. **数据导出与备份**
   - 点击"导出所有数据"生成完整的 JSON 备份文件
   - 点击"打开数据文件夹"直接访问存储目录
   - 支持手动备份和恢复数据文件

### ⌨️ 快捷键

- **ESC**: 关闭所有对话框和模态窗口
- **Ctrl+C**: 复制选中的令牌信息
- **Enter**: 在表单中确认输入

## 🔒 安全与隐私

- **本地存储**: 所有数据仅存储在本地设备，不上传到任何服务器
- **加密传输**: 所有网络请求使用 HTTPS 加密传输
- **状态验证**: 内置 CSRF 保护和状态验证机制
- **最小权限**: 应用程序仅请求必要的系统权限

## 🐛 故障排除

### 常见问题

1. **授权失败**: 检查网络连接，确保能访问 auth.augmentcode.com
2. **Token 无效**: 验证 JSON 格式是否正确，重新生成授权 URL
3. **数据丢失**: 检查数据文件夹权限，尝试重新启动应用程序
4. **性能问题**: 清理缓存数据，重启应用程序

### 技术支持

如遇到问题，请在 GitHub Issues 中提交详细的错误信息和复现步骤。

## 📄 许可证

本项目采用 MIT 许可证开源发布。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Pull Request 和 Issue。在贡献代码前，请确保：
- 代码通过所有测试
- 遵循项目的代码风格
- 更新相关文档
