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
        case '/edit.html':
            const uid = window.location.search.split('?uid=')[1]
            //保存ボタンを押されたとき
            document.getElementById('save-btn').addEventListener('click',()=>{
                return userModule.saveUser(uid)
            })
            //キャンセルボタンを押されたとき
            document.getElementById('cancel-btn').addEventListener('click',()=>{
                return window.location.href = '/'
            })
            //削除ボタンを押されたとき
            document.getElementById('delete-btn').addEventListener('click',()=>{
                return userModule.deleteUser(uid)
            })
            return userModule.setExsistingValue(uid)

        default:
            break;
    }
})()