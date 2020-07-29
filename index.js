const $=require("jquery");
const path=require("path");
const fs = require("fs");
$(document).ready(function(){

    alert("documenet loaded : "+process.cwd());

        let src = process.cwd();
        let name= path.basename(src);


        let data= { id : src, parent : "#", text : name }
           
        

        let chobj=getChilds(src);
        chobj.unshift(data);

       $("#tree").jstree({
         "core" : {
           // so that create works
           "check_callback" : true,
            "data": chobj
         } 
    }).on("open_node.jstree",function(e,data){
        // THIS FUNCTION GET CALLED WHENEVER YOU TRY TO OPEN A DIRECTORY
            let childs=data.node.children;
            for(let i=0;i<childs.length;i++){

                let cpath=childs[i];
                let grand_childs=getChilds(cpath)
                for(let j=0;j<grand_childs.length;j++){

                    let present=$("#tree").jstree(true).get_node(grand_childs[j].id);
                    if(present)
                    {
                            console.log("repetion ");
                            return;
                    }$("#tree").jstree().create_node(childs[i],grand_childs[j],"last");
                }


            }
    })



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
})

function getChilds(src){

    if(!fs.statSync(src).isDirectory())
        return [];
    let childrens=fs.readdirSync(src);
    let bacche=[]
    for(let i=0;i<childrens.length;i++){

        let child_path=path.join(src,childrens[i])
        let temp_obj={ id : child_path, 
                        parent : src,
                         text : childrens[i]
                 }
        bacche.push(temp_obj);
    }

    return bacche;
}