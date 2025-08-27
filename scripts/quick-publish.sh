#!/bin/bash

# 快速发布脚本
# 执行简化的发布流程，适合日常使用

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_step() {
    echo -e "${CYAN}🔄${NC} $1"
}

log_title() {
    echo -e "\n${PURPLE}📦 $1${NC}\n"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查依赖
check_dependencies() {
    log_step "检查依赖..."
    
    if ! command_exists node; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command_exists pnpm; then
        log_error "pnpm 未安装，请运行: npm install -g pnpm"
        exit 1
    fi
    
    if ! command_exists git; then
        log_warning "Git 未安装，将跳过Git相关操作"
    fi
    
    log_success "依赖检查完成"
}

# 解析版本类型
VERSION_TYPE="patch"
DRY_RUN=false
SKIP_TESTS=false
SKIP_BUILD=false
REGISTRY=""
TAG="latest"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --patch)
            VERSION_TYPE="patch"
            shift
            ;;
        --minor)
            VERSION_TYPE="minor"
            shift
            ;;
        --major)
            VERSION_TYPE="major"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        --beta)
            TAG="beta"
            shift
            ;;
        --alpha)
            TAG="alpha"
            shift
            ;;
        --help|-h)
            echo "快速发布脚本"
            echo ""
            echo "使用方式:"
            echo "  ./scripts/quick-publish.sh [选项]"
            echo ""
            echo "选项:"
            echo "  --patch        发布补丁版本 (默认)"
            echo "  --minor        发布次版本"
            echo "  --major        发布主版本"
            echo "  --dry-run      干运行模式"
            echo "  --skip-tests   跳过测试"
            echo "  --skip-build   跳过构建"
            echo "  --registry URL 指定注册表"
            echo "  --tag TAG      发布标签"
            echo "  --beta         发布Beta版本"
            echo "  --alpha        发布Alpha版本"
            echo "  --help, -h     显示帮助"
            echo ""
            echo "示例:"
            echo "  ./scripts/quick-publish.sh --patch"
            echo "  ./scripts/quick-publish.sh --minor --dry-run"
            echo "  ./scripts/quick-publish.sh --beta"
            exit 0
            ;;
        *)
            log_error "未知选项: $1"
            exit 1
            ;;
    esac
done

# 主函数
main() {
    log_title "快速发布 - swagger-2-request"
    
    # 检查依赖
    check_dependencies
    
    # 显示配置
    log_info "发布配置:"
    echo "  版本类型: $VERSION_TYPE"
    echo "  标签: $TAG"
    echo "  干运行: $DRY_RUN"
    echo "  跳过测试: $SKIP_TESTS"
    echo "  跳过构建: $SKIP_BUILD"
    if [[ -n "$REGISTRY" ]]; then
        echo "  注册表: $REGISTRY"
    fi
    
    # 确认继续
    if [[ "$DRY_RUN" != true ]]; then
        echo ""
        read -p "确认要继续发布吗? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_warning "发布已取消"
            exit 0
        fi
    fi
    
    # 检查工作目录状态
    if command_exists git; then
        log_step "检查Git状态..."
        if [[ -n $(git status --porcelain) ]]; then
            log_warning "工作目录有未提交的更改"
            git status --short
            echo ""
            read -p "是否继续? (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "发布已取消"
                exit 1
            fi
        else
            log_success "工作目录干净"
        fi
    fi
    
    # 安装依赖
    log_step "确保依赖已安装..."
    pnpm install --frozen-lockfile
    log_success "依赖安装完成"
    
    # 运行Lint检查
    log_step "运行代码检查..."
    if pnpm run lint; then
        log_success "代码检查通过"
    else
        log_warning "代码检查有警告，但继续发布"
    fi
    
    # 运行测试
    if [[ "$SKIP_TESTS" != true ]]; then
        log_step "运行测试..."
        pnpm test
        log_success "测试通过"
    else
        log_warning "跳过测试"
    fi
    
    # 构建项目
    if [[ "$SKIP_BUILD" != true ]]; then
        log_step "构建项目..."
        pnpm build
        log_success "构建完成"
    else
        log_warning "跳过构建"
    fi
    
    # 版本升级
    log_step "升级版本..."
    
    # 读取当前版本
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    log_info "当前版本: $CURRENT_VERSION"
    
    # 升级版本
    if [[ "$DRY_RUN" != true ]]; then
        pnpm version $VERSION_TYPE --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        log_success "版本已升级为: $NEW_VERSION"
    else
        log_info "干运行模式：版本升级被跳过"
    fi
    
    # 发布到NPM
    log_step "发布到NPM..."
    
    PUBLISH_CMD="pnpm publish --no-git-checks --access=public"
    
    if [[ "$TAG" != "latest" ]]; then
        PUBLISH_CMD="$PUBLISH_CMD --tag $TAG"
    fi
    
    if [[ -n "$REGISTRY" ]]; then
        PUBLISH_CMD="$PUBLISH_CMD --registry $REGISTRY"
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        PUBLISH_CMD="$PUBLISH_CMD --dry-run"
    fi
    
    eval $PUBLISH_CMD
    
    if [[ "$DRY_RUN" == true ]]; then
        log_success "干运行发布完成"
    else
        log_success "发布成功"
        
        # 创建Git标签
        if command_exists git; then
            log_step "创建Git标签..."
            NEW_VERSION=$(node -p "require('./package.json').version")
            git add package.json
            git commit -m "chore: bump version to $NEW_VERSION"
            git tag "v$NEW_VERSION"
            
            # 推送到远程
            read -p "是否推送到远程仓库? (y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git push
                git push --tags
                log_success "已推送到远程仓库"
            fi
        fi
        
        # 显示成功信息
        PACKAGE_NAME=$(node -p "require('./package.json').name")
        NEW_VERSION=$(node -p "require('./package.json').version")
        
        echo ""
        log_title "发布成功! 🎉"
        echo -e "${GREEN}包名:${NC} $PACKAGE_NAME"
        echo -e "${GREEN}版本:${NC} $NEW_VERSION"
        echo -e "${GREEN}标签:${NC} $TAG"
        echo ""
        echo -e "${YELLOW}安装命令:${NC}"
        echo "  npm install $PACKAGE_NAME"
        echo "  pnpm add $PACKAGE_NAME"
        echo ""
        echo -e "${BLUE}NPM 页面:${NC}"
        echo "  https://www.npmjs.com/package/$PACKAGE_NAME"
    fi
}

# 错误处理
trap 'log_error "发布过程中出现错误，请检查日志"; exit 1' ERR

# 运行主函数
main "$@"