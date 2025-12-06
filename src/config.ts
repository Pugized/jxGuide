// API base URL reserved here. You can set VITE_API_BASE in .env to override.
// export const API_BASE = 'http://10.210.251.152:8000/api'
export const API_BASE = 'http://localhost/api'
export const BASE_URL = '/'
export const AI_ROLE = '嘉祥AI';

export let API_KEY:string='';

let apiKeyFromEnv = import.meta.env.VITE_API_KEY;
console.log(apiKeyFromEnv);
if(apiKeyFromEnv && apiKeyFromEnv.trim() !== ''){
    API_KEY = apiKeyFromEnv;
}
if(!API_KEY){
    console.warn('未设置API_KEY。请在.env文件中设置VITE_API_KEY变量。');
    alert('未设置API_KEY。请在.env文件中设置VITE_API_KEY变量。');
}


export const ABOUT_SCHOOL=`成都市锦江区嘉祥外国语高级中学（资料卡片：{{infocard:jxschool}}），简称“锦江嘉祥”，由四川嘉祥实业集团有限公司举办（资料：{{infocard:jxgroup}}），是一所民办十二年一贯制、寄宿制学校。`;