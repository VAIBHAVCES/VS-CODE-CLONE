const $ = require("jquery");
const path = require("path");
const fs = require("fs");
let editor2;
$(document).ready(async function () {
  // alert("documenet loaded : "+process.cwd());

  let src = process.cwd();
  let name = path.basename(src);
  let monc;
   editor2=await createEditor();
  console.log(editor2);
  let data = { id: src, parent: "#", text: name };

  let chobj = getChilds(src);
  chobj.unshift(data);

  $("#tree")
    .jstree({
      core: {
        // so that create works
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
  
});

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
  console.log(src);
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