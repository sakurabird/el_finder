

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

//ブックマークを追加して、ファイルに保存
setBookmark = function(path){
  path = path.replace(/\/\//,'/') // ルートからのフォルダ選択でスラッシュが重なる問題の対処
  _G.bookmark_ary[path] = path
  showBookmarkList()
  saveJson(_G.save_path　+ '/bookmark.json',_G.bookmark_ary)
}

showBookmarkList = function(){
  var out =""
  for (var ind in _G.bookmark_ary ) {
    out += '<span class="bm_go btn" bmkey="'+ind+'">' +
        _G.bookmark_ary[ind] + '</span> ' + 
        sSilver(s80(ind)) + 
        '<span class="bm_del btn" bmkey="'+ind+'">del</span> '+
        '<span class="bl_edit btn" bmkey="' + ind + '">edit</span>' + '<br/>'
  }
  $('#bookmark_list').html( out )

}

setCurrentPath = function(path){
  path = path.replace(/\/\//,'/') // ルートからのフォルダ選択でスラッシュが重なる問題の対処
  _G.history_ary[path] = path
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
        str_link += '<a href="javascript:setCurrentPath(\'' + c_path + '\')">' +   "/" +ary_path[ind]  + '</a>'
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

  var shell = "ls -A '" + dir + "'"
  if (filter) shell += " | egrep -i '" + filter + "'"

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
      //listThumb(shell,filter,files_ret,node_ct,ext_ct)
      listInner(shell,filter,files_ret,node_ct,ext_ct)
      listDetail(shell,filter,files_ret,node_ct,ext_ct)
      listSimple(shell,filter,files_ret,node_ct,ext_ct)
    }
  )
}

listDetail = function(shell,filter,files_ret,node_ct,ext_ct) {}
listSimple = function(shell,filter,files_ret,node_ct,ext_ct) {}
listThumb = function(shell,filter,files_ret,node_ct,ext_ct) {
  var filelist_outstr =""
  for (var ind in files_ret){
    var filename_disp = files_ret[ind].filename
    if (filter) filename_disp = files_ret[ind].filename.replace(new RegExp( filter , 'gi'),sRed(filter))

    if (files_ret[ind].stat.isDirectory()) {

    }
    var ext = ""
    if (files_ret[ind].stat.isFile()) {
        filename_disp = ""
    }
    if ( files_ret[ind].ext.match(/(jpg|jpeg|png|gif|tiff)/i) ) filelist_outstr += '<img  height=70 src="file://' + files_ret[ind].fullpath + '"/> &nbsp;'
  }
  console.log(ext_ct)

  $('#filter_shell').html(
      sSilver(shell) + " " + sCrimson(files_ret.length) +
      sSilver(' file' + sGray(node_ct.file) + ' dir' + sGray(node_ct.dir)) + " ")
  $('#files1').html( '<br/>' + filelist_outstr )
}

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

  $('#filter_shell').html(
      sSilver(shell) + " " + sCrimson(files_ret.length) +
      sSilver(' file' + sGray(node_ct.file) + ' dir' + sGray(node_ct.dir)) + " ")
  $('#files1').html( filelist_outstr )
}