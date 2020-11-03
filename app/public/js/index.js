//ページ読み込み時に関数を実行
const indexModule = (() => {
    //検索ボタンをクリックした時のイベントリスナー設定
    document.getElementById('search-btn')
        .addEventListener('click',()=>{
            return searchModule.searchUsers()
        })
    //usersモジュールのfetchAllUsers()
    return userModule.fetchAllusers()
})()