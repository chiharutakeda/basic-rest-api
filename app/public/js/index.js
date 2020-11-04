//ページ読み込み時に関数を実行
const indexModule = (() => {
    const path =window.location.pathname

    switch (path) {
        case '/':
            //検索ボタンをクリックした時のイベントリスナー設定
            document.getElementById('search-btn').addEventListener('click',()=>{
                return searchModule.searchUsers()
            })
            //usersモジュールのfetchAllUsersメソッドを呼び出す
            return userModule.fetchAllusers()
        case '/create.html':
            //保存ボタンを押されたとき
            document.getElementById('save-btn').addEventListener('click',()=>{
                return userModule.createUser()
            })
            //キャンセルボタンを押されたとき
            document.getElementById('cancel-btn').addEventListener('click',()=>{
                return window.location.href = '/'
            })
            break;
        default:
            break;
    }
})()