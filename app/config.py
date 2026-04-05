"""
应用配置桥接模块
提供向后兼容的配置访问接口

注意：推荐直接使用 from app.core.config import settings
"""
from app.core.config import settings

# 向后兼容：这些是 settings 属性的引用
# 注意：在首次访问时才确定值
use_mongo = settings.MONGODB_ENABLED  # 类型: bool
use_redis = settings.REDIS_ENABLED    # 类型: bool