const $ = require("jquery");
const path = require("path");
const fs = require("fs");
let editor2;
let monc;
$(document).ready(async function () {
  // alert("documenet loaded : "+process.cwd());

  let src = process.cwd();
  let name = path.basename(src);
  
   editor2=await createEditor();
  console.log(editor2);
  let data = { id: src, parent: "#", text: name };

  let chobj = getChilds(src);
  chobj.unshift(data);

  $("#tree")
    .jstree({
      core: {
        // so that create works
        themes:{
          "icons":false
      },
        check_callback: true,
        data: chobj,
      },
    })
    .on("open_node.jstree", function (e, data) {
      // THIS FUNCTION GET CALLED WHENEVER YOU TRY TO OPEN A DIRECTORY
      let childs = data.node.children;
      // CHILDS HAVE CHILDRENS OF NODE I JUST CLICCKEED
      for (let i = 0; i < childs.length; i++) {
        let cpath = childs[i];
        let grand_childs = getChilds(cpath);
        for (let j = 0; j < grand_childs.length; j++) {
          // THIS CHECKS FOR IF THEIR IS ALREADY PRESENT OR NOT
          let present = $("#tree").jstree(true).get_node(grand_childs[j].id);
          if (present) {
            console.log("repetion ");
            return;
          }
          $("#tree").jstree().create_node(childs[i], grand_childs[j], "last");
        }
      }
    })
    .on("select_node.jstree", function (e, data) {
      // THIS REGION ACTIVATES WHNENVER I CLICK A NON DIRECTORY THING

      let file_path = data.node.id;
      // remeber that after reading you need to stringfy it else memory buffer will be printed
      let stats = fs.lstatSync(file_path).isFile();
      if (!stats) return;

      createTab(file_path);
      setContent(file_path);
      
      // monaco.editor.setModelLanguage(editor2.getModel(),extName);
      // console.log(file_content);
    });

  //  ****************TRY FOR RESIZEABLE
  $( function() {
    $( "#file-explorer" ).resizable();
  } );

  // ****************FACED EEVENET BUBBLING HERE
  // let src=process.cwd();
  // let name=path.basename(src);
  // $("#tree").html(name);
  // $("#tree").on("click",function(){
  //     console.log("sucess function was called");
  //    let children=fs.readdirSync(src);
  //    for(let i=0;i<children.length;i++){

  //         $(this).append(`<li>${children[i]}</li>`);
  //    }

  // })

 

  function getChilds(src) {
    if (!fs.statSync(src).isDirectory()) return [];
    let childrens = fs.readdirSync(src);
    let bacche = [];
    for (let i = 0; i < childrens.length; i++) {
      let child_path = path.join(src, childrens[i]);
      let temp_obj = { id: child_path, parent: src, text: childrens[i] };
      bacche.push(temp_obj);
    }
  
    return bacche;
  }
  
  const os = require("os");
  const pty = require("node-pty");
  // const { editor } = require("monaco-editor");
  // UI
  const Terminal = require("xterm").Terminal;
  // Initialize node-pty with an appropriate shell
  console.log();
  const shell = process.env[os.platform() === "win32" ? "COMSPEC" : "SHELL"];
  // Magic
  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env,
  });
  // console.log(process.env);

  
  let { FitAddon } = require('xterm-addon-fit');
  const xterm = new Terminal();
  const fitAddon=new FitAddon();
  xterm.loadAddon(fitAddon);
  xterm.setOption('theme', { background: 'rebeccapurple' });
  // document
  xterm.open(document.getElementById("terminal"));
  // Setup communication between xterm.js and node-pty
  xterm.onData(function (data) {
    // console.log("Command "+data);
    ptyProcess.write(data);
  });
  // Magic
  
  ptyProcess.on("data", function (data) {
    xterm.write(data);
  });
  fitAddon.fit();

  monc.editor.defineTheme('dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [{ background: '#1e2024' }],
    "colors": {
        "editor.foreground": "#F8F8F8",
        "editor.background": "#1e2024",
        "editor.selectionBackground": "#DDF0FF33",
        "editor.lineHighlightBackground": "#FFFFFF08",
        "editorCursor.foreground": "#A7A7A7",
        "editorWhitespace.foreground": "#FFFFFF40"
    }
});
monc.editor.defineTheme('light', {
    "base": "vs",
    "inherit": true,
    rules: [{ background: '#1e2024' }],
    "colors": {
        "editor.foreground": "#3B3B3B",
        "editor.background": "#FFFFFF",
        "editor.selectionBackground": "#BAD6FD",
        "editor.lineHighlightBackground": "#00000012",
        "editorCursor.foreground": "#000000",
        "editorWhitespace.foreground": "#BFBFBF"
    }
});
let isDark = false;
$(".btn.save").on("click", function () {
    if (isDark) {
      monc.editor.setTheme('light');
    } else {
      monc.editor.setTheme('dark');
    }
    isDark = !isDark;
}) 

});

// $(".btn.save").on("click",function(){

//   // const parseTmTheme = require('monaco-themes').parseTmTheme;
//   // var themeData = MonacoThemes.parseTmTheme(tmThemeString);
//   // monaco.editor.defineTheme('mytheme', themeData);
//   // monaco.editor.setTheme('mytheme');
//   console.log("i got kicked");
  
// })
  


function setContent(file_path){

  let file_content = fs.readFileSync(file_path) + "";
  editor2.getModel().setValue(file_content);
  let extension=path.extname(path.basename(file_path));
  let extName= extension.split(".")[1];
  console.log("setting extension aas: "+extName);
  if(extName=='js')
  {
    monaco.editor.setModelLanguage(editor2.getModel(),'javascript');
  }else{
    monaco.editor.setModelLanguage(editor2.getModel(),extName);
  }

}
function createEditor() {
    
  const path = require("path");
  const amdLoader = require("./node_modules/monaco-editor/min/vs/loader.js");
  const amdRequire = amdLoader.require;
  const amdDefine = amdLoader.require.define;

  function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, "/");
    if (pathName.length > 0 && pathName.charAt(0) !== "/") {
      pathName = "/" + pathName;
    }
    return encodeURI("file://" + pathName);
  }

  amdRequire.config({
    baseUrl: "./node_modules/monaco-editor/min",
  });

  // workaround monaco-css not understanding the environment
  self.module = undefined;
  return new Promise(function(resolve,reject){

      amdRequire(["vs/editor/editor.main"], function () {
          var editor = monaco.editor.create(
            document.querySelector("#monaco-codearea"),
            {
              value: [
                "function x() {",
                '\tconsole.log("Hello world! mai hoo khalnayak");',
                "}",
              ].join("\n"),
              language: "javascript",
              
            }
          );
          monc=monaco;
          resolve( editor);
        });
      //   console.log("i am editor at line 150 : "+editor);
        

  })
  

}

function createTab(src) {
  let fName = path.basename(src);
  // let hist=$(".tab-container div span").attr("id");
  let hist= document.querySelectorAll(".tab-container div span");
  if(hist.length>0){
    for(let i=0;i<hist.length;i++){
      let path=hist[i].getAttribute("id");
      if(path==src)
        return ;
    }
  }
  console.log("history is : "+hist.length);
  $(".tab-container").append(`
  <div class="tab" ><span onclick=handleClick(this) id='${src}'>${fName}</span>
  <i class="fas fa-times" onclick=handleClose(this) id='${src}'></i>
  </div>`);
}
function handleClick(elem) {
  // console.log("clicked");
  let src = $(elem).attr("id");
  setContent(src);
}

function handleClose(elem){
  console.log("close funciton called");
  $(elem).parent().remove();

}