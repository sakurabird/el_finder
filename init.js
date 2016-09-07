
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

//ブックマークイベント 削除 edit go
$(document).on('click','.bm_del', function(e) {
	console.log('bl_del' , e.target)
	delete　_G.bookmark_ary[$(e.target).attr('bmkey')]
	toggleBookmarkList('down','')
})
$(document).on('click','.bm_edit', function(e) {
	console.log('bm_edit' , e.target)
})
$(document).on('click','.bm_go', function(e) {
	console.log('bm_go' , e.target)
	setCurrentPath($(e.target).attr('bmkey'))
})


$(document).on('mouseover','.tFile', function(e) {
  console.log('mouseOver ' , e.target)
  var fname = $(e.target).text()
  $('#file_name').html( fname )

  if (fname.match(/(.png|.jpeg|.jpg|.gif)$/)){
    $('#file_contents').html('<img src="' + _G.current_path + '/' + fname + '" />')

    return 
  }

  osRunOut("cat '" + fname + "' | head -c 10000" , 'file_contents','replace' )
})


$(document).on('mouseover','.tDir', function(e) {
  console.log('mouseOver ' , e.target)
  $('#file_name').html( sBlue($(e.target).text()) )
  osRunOut('ls ' + $(e.target).text() , 'file_contents','replace' )
})




$('#command_str').on('keyup',function(e){
  if (e.which == 13){
      osRunOut($(this).val(),'command_out','replace')
  }
})


$('#filter_bookmark').on('keyup',function(e){

	//enterなら候補1に移動  それ以外のキーなら再フィルタ
  if (e.which ==13) {	
    	setCurrentPath($('span[bmlistnum=1]').attr('bmkey'))
		  toggleBookmarkList('up','')
	}else{
		toggleBookmarkList('down',$('#filter_bookmark').val())
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

    if (e.which ==27) {  // esc いろいろ開いてるもの閉じる
      toggleBookmarkList('up','')
      toggleFindgrep('up')
    }



})


