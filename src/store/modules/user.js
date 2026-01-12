import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defAva from '@/assets/images/profile.jpg'

const useUserStore = defineStore(
  'user',
  {
    state: () => ({
      token: getToken(),
      id: '',
      name: '',
      avatar: '',
      roles: [],
      permissions: [],
      // 是否需要绑定Google验证器
      needBindGoogleAuth: false,
      // Google验证器绑定信息
      googleAuthInfo: {}
    }),
    actions: {
      // 登录方法现在由页面直接处理，这里保留用于兼容
      login(userInfo) {
        const username = userInfo.username.trim()
        const password = userInfo.password
        const code = userInfo.code
        const uuid = userInfo.uuid
        const googleCode = userInfo.googleCode
        return new Promise((resolve, reject) => {
          login(username, password, code, uuid, googleCode).then(res => {
            // 如果需要绑定Google验证器，则不设置token
            if (res.needGoogleBind) {
              reject(new Error('需要绑定Google验证器'));
              return;
            }
            setToken(res.token)
            this.token = res.token
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      },


      // 初始化Google验证器状态
      async initGoogleAuthStatus() {
        try {
          const res = await checkGoogleAuthStatus();
          if (res.code === 200) {
            const { isGoogleAuthEnabled, needBind } = res.data || {};
            this.needBindGoogleAuth = !!needBind;
          }
        } catch (error) {
          console.error('初始化Google验证器状态失败:', error);
        }
      },

      // 获取用户信息
      getInfo() {
        return new Promise((resolve, reject) => {
          getInfo().then(res => {
            const user = res.user
            const avatar = (user.avatar == "" || user.avatar == null) ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar;

            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              this.roles = res.roles
              this.permissions = res.permissions
            } else {
              this.roles = ['ROLE_DEFAULT']
            }
            this.id = user.userId
            this.name = user.userName
            this.avatar = avatar
            resolve(res)
          }).catch(error => {
            reject(error)
          })
        })
      },
      // 退出系统
      logOut() {
        return new Promise((resolve, reject) => {
          logout(this.token).then(() => {
            this.token = ''
            this.roles = []
            this.permissions = []
            removeToken()
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      }
    }
  })

export default useUserStore
