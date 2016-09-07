
$("#filter").keyup((e) =>{ showFilelist(_G.current_path , $('#filter').val()) })

_G.userhome_path
_G.username = ""
_G.current_path = ""
_G.history_ary = []
_G.bookmark_ary = {}

exec("whoami",execOption,(error, stdout, stderr) => {
    _G.username = stdout.trim()
    $('#username').html(_G.username)
})
exec("echo $HOME",execOption,(error, stdout, stderr) => {
    _G.userhome_path = stdout.trim()
    _G.current_path = _G.userhome_path
    goDir(_G.current_path)
})

//保存ファイル読み込み
if (!fs.existsSync('userdata')) fs.mkdir('userdata')

_G.bookmark_ary = loadJson(_G.save_path　+ '/bookmark.json')
if (!_G.bookmark_ary) _G.bookmark_ary = {}

//ブックマークイベント
$(document).on('click','.bm_del', function(e) {
	console.log('bl_del' , e.target)
	delete　_G.bookmark_ary[$(e.target).attr('bmkey')]
	showBookmarkList()
})
$(document).on('click','.bm_edit', function(e) {
	console.log('bm_edit' , e.target)
})
$(document).on('click','.bm_go', function(e) {
	console.log('bm_go' , e.target)
	setCurrentPath($(e.target).attr('bmkey'))

})

$('#filter_bookmark').on('keydown',function(e){
    if (e.which ==13) {	
    //filterBookmark()
	}
})


//ショートカット
$(document).on('keydown', function(e) {
    console.log("key metakey shiftkey ctrlkey" , e.which, e.metaKey, e.shiftKey, e.ctrlKey )

    if (e.which ==38 && e.metaKey) {  //  com up
       _G.current_path = _G.current_path.replace(/(.*)(\/.*?$)/,'$1')
       if (!_G.current_path) _G.current_path="/"
       goDir(_G.current_path)
    }
    if (e.which == 37 && e.metaKey) {  //  com left  ひとつ前のフォルダ
    	console.log('com left')
    	console.log('_G.history_ary',_G.history_ary)
    	console.log('pop',_G.history_ary.pop())
       _G.current_path = _G.history_ary.pop()
       if (!_G.current_path) _G.current_path="/"
       goDir(_G.current_path)
    }

    if (e.which ==72 && e.metaKey) {  // com H
       goDir(userhome_path)
    }
    if (e.which ==78 && e.metaKey) {  // com N
	    toggleNew('toggle')
    }

    if (e.which ==66 && e.metaKey) {  // com B    
	    toggleBookmarkList('toggle','')
	}
    if (e.which ==70 && e.metaKey) {  // com F   
		toggleFindgrep('toggle')
	}


    // if (e.which ==67 ) {  // C キーでchromeオープン
    //   osrun('open -a "/Applications/Google Chrome.app"')
    // }
})


