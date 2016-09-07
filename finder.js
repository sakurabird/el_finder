

setHistory=function(){
  var out =""
  for (var ind in _G.history_ary ) out += '<a href="javascript:void(0)" onClick="setCurrentPath(\'' + _G.history_ary[ind] + '\')">' +_G.history_ary[ind] + '</a><br/>'
  $('#history_list').html( out)

}

setDirSize = function(){
    osRunCb('du -d0 -h',function(ret_ary){
        $('#dir_size').html(ret_ary.join(''))

    })
}

toggleFindgrep = function(updown){

  if (!updown.match(/(up|down|toggle)/)) alert('updown not up or down')

  if (updown == 'toggle' ){
    if ($('#findgrep').css('display') == 'block')  updown = 'up'
    else  updown = 'down'
  }
  if (updown == 'up'){
      $('#findgrep').slideUp(10)
      return
  }

  //あとはdown
  $('#findgrep').slideDown(10)
  $('#filter').focus() 
}

toggleNew = function(updown ){

  if (!updown.match(/(up|down|toggle)/)) alert('updown not up or down')

  if (updown == 'toggle' ){
    if ($('#new_action').css('display') == 'block')  updown = 'up'
    else  updown = 'down'
  }
  if (updown == 'up'){
      $('#new_action').slideUp(10)
      return
  }

  //あとdown
  $('#new_action').slideDown(10)

}


//ブックマークを追加して、ファイルに保存
setBookmark = function(path){
  path = path.replace(/\/\//,'/') // ルートからのフォルダ選択でスラッシュが重なる問題の対処
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
  var ary_out = []
  for (var ind in _G.bookmark_ary ) {
      if (ind.match(re1) || _G.bookmark_ary[ind].match(re1)) {
          ary_out[ind] = _G.bookmark_ary[ind]
      }
  }

  //表示
  var bm_list_num = 1;
  var out ="<table>"
  for (var ind in ary_out ) {
    path_disp = ind
    name_disp = ary_out[ind]
    if (filter){
        path_disp = path_disp.replace(re1,sRed('$1'))
        name_disp = name_disp.replace(re1,sRed('$1'))
    }

    out += '<tr>' + 
        '<td><span class="bm_go btn" bmlistnum="' + bm_list_num + '" bmkey="' + ind + '">' +
        name_disp + '</span> ' + 
        '</td><td>' + 
        sSilver(s80(path_disp)) + 
        '</td><td>' +
        '<span class="bm_del btn" bmkey="'+ ind +'">del</span> '+
        '</td><td>' + 
        '<span class="bl_edit btn" bmkey="' +  ind + '">edit</span>' + 
        '</td></tr>'

    bm_list_num++
  }

  $('#bookmark_list').html( out + '</table>' )
  $('#bookmark').slideDown(10)
  $('#filter_bookmark').focus()

}

setCurrentPath = function(path){
  path = path.replace(/\/\//,'/') // ルートからのフォルダ選択でスラッシュが重なる問題の対処
  _G.history_ary.push(path)
  setHistory()
  $('#filter').val('')
  $('#dir_size').html('')

  execOption.cwd = path
  console.log('current ' + execOption.cwd)

  console.log(_G.history_ary)
  ary_path = path.trim().split(/\//)

    var str_link = ""
    var c_path = ""
    //階層ごとにリンク
    for (var ind in ary_path){
        if (ind == 0 ) continue
        c_path += "/" + ary_path[ind]
        str_link += '<span class="link" onClick="setCurrentPath(\'' + c_path + '\')">' +   "/" +ary_path[ind]  + '</span>'
    }
    $('#current').html( str_link )

    _G.current_path = c_path
    showFilelist(_G.current_path,$('#filter').val())
    $("#filter").focus()

}

goDir = function(path){
  if ( path == undefined) return;
  setCurrentPath(path)
}

makeFile= function(filename){
    var cmd = "echo '' > " + _G.current_path + "/" + filename
    osrun(cmd ,function(){
      console.log(filename)
      goDir(_G.current_path)
    })
}
makeDir =function(dirname){
    var cmd = "mkdir " + _G.current_path + "/" + dirname
    osrun(cmd ,function(){
      console.log(dirname)
      goDir(_G.current_path)
    })
}

openFinder = function(path){
  osrun("open " + path,null)
}

termOpen = function(path){
  console.log(path)
  osrun("open -a /Applications/iTerm.app",null)
}

showFilelist = function(dir,filter){
  console.log(dir,filter)

  //シェル文字列組み立て
  var shell = "ls -A '" + dir + "'"
  if (filter) shell += " | egrep -i '" + filter + "'"

  //シェル実行
  osRunCb(shell,
    function(filelist_ary){
      var node_ct = { file:0, dir:0 };
      var ext_ct = { };
      var files_ret = [];

      for (var ind in filelist_ary){
          files_ret[ind] = []
          files_ret[ind].fullpath = dir + "/" + filelist_ary[ind]
          files_ret[ind].stat = fs.statSync(files_ret[ind].fullpath)
          files_ret[ind].filename = filelist_ary[ind]

          if (files_ret[ind].stat.isDirectory()) {
              node_ct.dir++
          }

          //拡張子統計
          files_ret[ind].ext = ""
          if (files_ret[ind].stat.isFile()) {
              node_ct.file++

              if (files_ret[ind].filename.substr(0,1) != ".") {
                files_ret[ind].ext = files_ret[ind].filename.replace(/(\?.*)/,"").replace(/.*\./,"") // うしろの?以降をとって、そのえとピリオド以前を除去
              }
              if (ext_ct[ files_ret[ind].ext ]) {
                ext_ct[ files_ret[ind].ext ]++
              }else{
                ext_ct[ files_ret[ind].ext ]=1
              }
          }
      }

      //表示方法切り替え 画像サムネイル　シンプル ls-s (detail)
      //listThumb(shell,filter,files_ret,node_ct,ext_ct)
      //listInner(shell,filter,files_ret,node_ct,ext_ct)
      //listDetail(shell,filter,files_ret,node_ct,ext_ct)
      listSimple(shell,filter,files_ret,node_ct,ext_ct)
    }
  )
}

listDetail = function(shell,filter,files_ret,node_ct,ext_ct) {}
listSimple = function(shell,filter,files_ret,node_ct,ext_ct) {

  var re1 = new RegExp( '(' + filter + ')', 'gi')

  var filelist_outstr =""
  for (var ind in files_ret){
      var filename_disp = files_ret[ind].filename
      if (filter) filename_disp = files_ret[ind].filename.replace(re1,sRed('$1'))

      if (files_ret[ind].stat.isDirectory()) {
          filename_disp = '<a class="tDir" onClick="goDir(_G.current_path + \'' + '/' + files_ret[ind].filename + '\')" href="javascript:void(0);">' + sBold(sDodgerblue(filename_disp)) + '</a> ' +
                          sSilver(' + ')
      }
      var ext = ""
      if (files_ret[ind].stat.isFile()) {
          filename_disp = '<span class="tFile">' +filename_disp + '</span>'
      }
      filelist_outstr += filename_disp + '<br/>'
  }

  $('#filter_shell').html( sSilver(shell) + ' ' + sCrimson(files_ret.length))
  $('#file_count').html(node_ct.file) 
  $('#dir_count').html(node_ct.dir)

  $('#file_list').html( filelist_outstr )
}
listThumb = function(shell,filter,files_ret,node_ct,ext_ct) {
  var filelist_outstr =""
  for (var ind in files_ret){
    var filename_disp = files_ret[ind].filename
    if (filter) filename_disp = files_ret[ind].filename.replace(re1,sRed('$1'))

    if (files_ret[ind].stat.isDirectory()) {

    }
    var ext = ""
    if (files_ret[ind].stat.isFile()) {
        filename_disp = ""
    }
    if ( files_ret[ind].ext.match(/(jpg|jpeg|png|gif|tiff)/i) ) filelist_outstr += '<img  height=70 src="file://' + files_ret[ind].fullpath + '"/> &nbsp;'
  }
  console.log(ext_ct)

  $('#filter_shell').html( sSilver(shell) + ' ' + sCrimson(files_ret.length))
  $('#file_count').html(node_ct.file) 
  $('#dir_count').html(node_ct.dir)

  $('#file_list').html( filelist_outstr )
}

//中身も表示
listInner = function(shell,filter,files_ret,node_ct,ext_ct) {
  var filelist_outstr =""
  for (var ind in files_ret){
      var filename_disp = files_ret[ind].filename
      if (filter) filename_disp = files_ret[ind].filename.replace(new RegExp( filter , 'gi'),sRed(filter))

      if (files_ret[ind].stat.isDirectory()) {
          filename_disp = '<a onClick="goDir(_G.current_path + \'' + '/' + files_ret[ind].filename + '\')" href="javascript:void(0);">' + sBold(sDodgerblue(filename_disp)) + '</a> ' +
                          sSilver(' + ')
      }
      var ext = ""
      if (files_ret[ind].stat.isFile()) {
          filename_disp = filename_disp
      }

      filelist_outstr += filename_disp + '<br/>'

      //テキストや画像の中身も表示
      if (files_ret[ind].stat.isFile()) {
          if ( files_ret[ind].ext.match(/(jpg|jpeg|png|gif|tiff)/i) ) filelist_outstr += '<img  height=70 src="file://' + files_ret[ind].fullpath + '"/><br/>'
          if ( files_ret[ind].ext.match(/(html|htm|js|coffee|php|rb|py|txt|xml|yaml|webloc|cpp|h|json|lua|plist|log|md)$/i)
              || files_ret[ind].filename.substr(0,1) == "." ) {
              var filetext = fs.readFileSync(files_ret[ind].fullpath,'utf-8').substr(0,500)
              var htmlencoded = $('<div/>').text(filetext).html()
              filelist_outstr += '<div style="margin-left:10px; margin-top:3px; font-size:70%;" >' + sSilver(htmlencoded) + '</div>'
          }
      }
  }

  $('#filter_shell').html( sSilver(shell) + ' ' + sCrimson(files_ret.length))
  $('#file_count').html(node_ct.file) 
  $('#dir_count').html(node_ct.dir)

  $('#file_list').html( filelist_outstr )
}


