// Casdoor 端点的几种常见配置，请根据您的实际情况选择

// 选项 1: 标准 Casdoor 路径（当前使用）
const config1 = {
  authorization: `${process.env.CASDOOR_ENDPOINT}/login/oauth/authorize`,
  token: `${process.env.CASDOOR_ENDPOINT}/login/oauth/access_token`,
  userinfo: `${process.env.CASDOOR_ENDPOINT}/api/userinfo`,
};

// 选项 2: 带 /api 前缀的路径
const config2 = {
  authorization: `${process.env.CASDOOR_ENDPOINT}/api/login/oauth/authorize`,
  token: `${process.env.CASDOOR_ENDPOINT}/api/login/oauth/access_token`,
  userinfo: `${process.env.CASDOOR_ENDPOINT}/api/userinfo`,
};

// 选项 3: 简化路径
const config3 = {
  authorization: `${process.env.CASDOOR_ENDPOINT}/oauth/authorize`,
  token: `${process.env.CASDOOR_ENDPOINT}/oauth/token`,
  userinfo: `${process.env.CASDOOR_ENDPOINT}/api/userinfo`,
};

// 选项 4: 带组织和应用名称的路径
const config4 = {
  authorization: `${process.env.CASDOOR_ENDPOINT}/login/oauth/authorize?organization=${process.env.CASDOOR_ORGANIZATION_NAME}&application=${process.env.CASDOOR_APP_NAME}`,
  token: `${process.env.CASDOOR_ENDPOINT}/login/oauth/access_token`,
  userinfo: `${process.env.CASDOOR_ENDPOINT}/api/userinfo`,
};

export { config1, config2, config3, config4 };