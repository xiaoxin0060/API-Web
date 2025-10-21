// Vercel代理函数 - 解决HTTPS→HTTP混合内容问题
export default async function handler(req, res) {
  // 从环境变量读取生产环境后端地址
  const BACKEND_URL = process.env.PROD_BACKEND_URL || 'http://localhost:8082';
  
  // 设置CORS头，支持Cookie认证
  const origin = req.headers.origin;
  if (origin && origin.includes('vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 处理OPTIONS预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 构建目标URL
  const apiPath = req.url.replace('/api/proxy', '') || req.query.path || '';
  const targetUrl = `${BACKEND_URL}${apiPath.startsWith('/') ? apiPath : '/api' + apiPath}`;
  
  try {
    // 转发请求，保留Cookie等认证信息
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.cookie || '',
        'User-Agent': req.headers['user-agent'] || '',
        ...(req.headers['x-request-id'] && { 'X-Request-Id': req.headers['x-request-id'] }),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.body 
        ? JSON.stringify(req.body) 
        : undefined,
    });
    
    // 转发Set-Cookie等响应头
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }
    
    const data = await response.text();
    let jsonData;
    
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }
    
    res.status(response.status).json(jsonData);
    
  } catch (error) {
    console.error('代理错误:', error.message);
    res.status(500).json({ 
      code: 500, 
      message: '代理请求失败', 
      data: null 
    });
  }
}
