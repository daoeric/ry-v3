import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid, googleCode) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  // 如果提供了Google验证码，也添加到请求数据中
  if (googleCode) {
    data.googleCode = googleCode
  }
  return request({
    url: '/login',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

// 绑定Google验证器
export function bindGoogleAuthCode(data) {
  return request({
    url: '/sys/google/bind',
    method: 'post',
    data: data
  })
}

// 绑定Google验证器（带用户名）
export function bindGoogleAuthCodeWithUsername(code, secret, username) {
  const data = {
    code,
    secret,
    username
  }
  return request({
    url: '/sys/google/bind',
    method: 'post',
    data: data
  })
}



// 登录方法
// export function login(username, password, code, uuid, googleCode) {
//   const data = {
//     username,
//     password,
//     code,
//     uuid
//   }
//   // 如果提供了Google验证码，也添加到请求数据中
//   if (googleCode) {
//     data.googleCode = googleCode
//   }
//   return request({
//     url: '/login',
//     headers: {
//       isToken: false,
//       repeatSubmit: false
//     },
//     method: 'post',
//     data: data
//   })
// }

// 检查用户是否已绑定Google验证器
// export function checkGoogleAuthStatus() {
//   return request({
//     url: '/system/user/checkGoogleAuthStatus',
//     method: 'get'
//   })
// }

// 获取Google验证器绑定信息
// export function getGoogleAuthInfo() {
//   return request({
//     url: '/system/user/getGoogleAuthInfo',
//     method: 'get'
//   })
// }
//
// // 验证Google验证码
// export function verifyGoogleAuth(data) {
//   return request({
//     url: '/system/user/verifyGoogleAuth',
//     method: 'post',
//     data: data
//   })
// }
