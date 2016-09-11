

//ブックマークを追加して、ファイルに保存
setBookmark = function(path){
  console.log('setBookmark ' + path)
  if (!fs.existsSync(path)) {
    alert(path + ' not exist')
    return false;
  }

  if ( _G.bookmark_ary[path] ){
      console.log('登録済 更新' + path )
  }

  _G.bookmark_ary[path] = path.replace(/(.*\/)(.*?)/,'$2')
  toggleBookmarkList('down','')
  saveJson(_G.save_path　+ '/bookmark.json',_G.bookmark_ary)
}

toggleBookmarkList = function(updown , filter ){

  if (!updown.match(/(up|down|toggle)/)) alert('updown not up or down')
  if (filter == undefined) alert('toggleBookmarkList filter undefined')

  $('#filter_bookmark').val(filter)

  if (updown == 'toggle' ){
    if ($('#bookmark').css('display') == 'block')  updown = 'up'
    else  updown = 'down'
  }

  if (updown == 'up'){
      $('#bookmark').slideUp(10)
      return
  }

  //あとはdownの処理
  var re1 = new RegExp( '(' + filter + ')', 'gi')

  //絞込
  var ary_bm_out = []
  for (var ind in _G.bookmark_ary ) {
      if (ind.match(re1) || _G.bookmark_ary[ind].match(re1)) {
          ary_bm_out[ind] = _G.bookmark_ary[ind]
      }
  }

  //表示
  var bm_list_num = 1;
  var out = []
  for (var ind in ary_bm_out ) {

    var classname="tFile"
    if (fs.statSync(ind).isDirectory()) classname = "tDir"

    var path_disp = ind
    var name_disp = ary_bm_out[ind]
    if (filter){
        path_disp = path_disp.replace(re1,sRed('$1'))
        name_disp = name_disp.replace(re1,sRed('$1'))
    }
    out.push(
      { "name": '<span class="bm_go ' + classname +'" bmlistnum="' + bm_list_num + '" bmkey="' + ind + '">' +
        name_disp + '</span>',
        "path": sSilver(s80(path_disp)),
        "del": '<span class="bm_del btn" bmkey="'+ ind +'">del</span> ',
        "edit": '<span class="bl_edit btn" bmkey="' +  ind + '">edit</span>'
      })
    bm_list_num++
  }
  $('#bookmark_list').html( ary2html(out) )

  var ary_his_out = []
  for (var ind in _G.history_ary ) { 
      if ( ind.match(re1) || _G.history_ary[ind].match(re1) ) {
          ary_his_out[ind] = _G.history_ary[ind]
      }
  }
  out = []
  for (var ind in ary_his_out ) {

    var classname="tFile"
    if (fs.statSync(ind).isDirectory()) classname = "tDir"

    var path_disp = ind
    var name_disp = ary_his_out[ind]
    if (filter){
        path_disp = path_disp.replace(re1,sRed('$1'))
        name_disp = name_disp.replace(re1,sRed('$1'))
    }
    out.push(
      { "name": '<span class="bm_go ' + classname +'" bmlistnum="' + bm_list_num + '" bmkey="' + ind + '">' +
        name_disp + '</span>',
        "path": sSilver(s80(path_disp)),
        "del": '<span class="bm_del btn" bmkey="'+ ind +'">del</span> ',
        "edit": '<span class="bl_edit btn" bmkey="' +  ind + '">edit</span>'
      })
    bm_list_num++
  }
  $('#history_list').html( ary2html(out) )

  $('#bookmark').slideDown(10)
  $('#filter_bookmark').focus()
}




// 最初に人がよく使うフォルダやファイルを自動でbookmarkしておく
setInitialBookmark = function(){
  //file:  basiprofile etc/hosts  sudoer passwd
  var files =[
    '/etc/hosts' , '/etc/passwd' , '/etc/sudoers' ,

    '/var/log','/etc',
    '/Applications' , 
    '/Applications/utilities' , 
    '/Applications/iTunes.app' ,
    '/Volumes' , 
 //   '/var/spool/cron' ,

    '/Users/' + _G.username ,
    '/Users/' + _G.username + '/Desktop',
    '/Users/' + _G.username + '/Downloads',
    '/Users/' + _G.username + '/.Trash',
    '/Users/' + _G.username + '/.ssh',
    '/Users/' + _G.username + '/.bash_profile',
    '/Users/' + _G.username + '/.bash_history'
  ]



  for (var ind in files){
    setBookmark(files[ind])
  }
}


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
    clickBookmark( $(e.target).attr('bmkey') )
    toggleBookmarkList('up','')
    $('#mainwin').show()
})

clickBookmark = function(_path){

  //fileかdirか 

  var stat = fs.statSync(_path)
  var filepath, filename

  filepath = _path
  if (!stat.isDirectory()) {
    filename = path.basename( _path )
    filepath = path.dirname( _path )
  }

  goDir( filepath )
  console.log('_path',_path)

  if (!stat.isDirectory()) showFileContents( _path )
  else clearFileContents()

}


$('#filter_bookmark').on('keyup',function(e){

  //enterなら候補1に移動  それ以外のキーなら再フィルタ
  if (e.which ==13) { 
      clickBookmark($('span[bmlistnum=1]').attr('bmkey'))
      toggleBookmarkList('up','')
      $('#mainwin').show()
  }else{
    toggleBookmarkList('down',$('#filter_bookmark').val())
  }
})

