 function navselect() {
     $(".maincont").html(`<select onchange="select(this.options[this.selectedIndex].value)">
<option style="display:none" disabled selected value> -- Wybierz -- </option>
                <option value="open">Pytanie otwarte</option>
                <option value="single">Pytanie pojedyńczego wyboru</option>
                <option value="chapter">Rozdział</option>
                <option value="multi">Pytanie wielokrotnego wyboru</option>
            </select>
            <div class="selectedcontent">

            </div>`)
 }

 function select(selected) {
     window.quill1 = "";
     window.quill2 = "";
     window.quill3 = "";
     window.quill4 = "";
     window.quill5 = "";
     $("#err").html("");
     let container = $(".selectedcontent");
     container.html("");

     if (selected == 'single') {

         container.html(`               <div>
                <label  for="name">Etykieta pytania</label>
                <input id="singlename" type="text" name="name">  
                </div>              
                <div id="singlecontent">
                </div>
                <div class="num">
                <label class="a" for="single1"><input id="single1" type="radio" value="1" name="ans" checked>Pierwsza odpowiedź</label>
                <div id="single1ans">
                </div>                
                </div>
                <div>
                <div class="num">
                <label class="a" for="single2"><input id="single2" type="radio" value="2" name="ans" checked>Druga odpowiedź</label>
                <div id="single2ans">

                </div>
                
                </div>
                </div>
                <button id='possibility' onclick="addpossibility()">Dodaj możliwą odpowiedź</button>
                <button onclick="addsingle()">Dodaj</button> <div id="err"></div>`);
         quil1("singlecontent");
         quil2("single1ans");
         quil3("single2ans");
         quilleditor();

     } else if (selected == 'multi') {
         container.html(`               <div>
                <label  for="name">Etykieta pytania</label>
                <input id="multiname" type="text" name="name">  
                </div>              
                <div id="multicontent">
                </div>
                <div class="num">
                <label class="a" for="multi1"><input id="multi1" type="checkbox" value="1" name="ans" checked>Pierwsza odpowiedź</label>
                <div id="multi1ans">
                </div>                
                </div>
                <div>
                <div class="num">
                <label class="a" for="multi2"><input id="multi2" type="checkbox" value="2" name="ans" checked>Druga odpowiedź</label>
                <div id="multi2ans">

                </div>
                
                </div>
                </div>
                <button id='possibility' onclick="addpossibility1()">Dodaj możliwą odpowiedź</button>
                <button onclick="addmulti()">Dodaj</button> <div id="err"></div>`);
         quil1("multicontent");
         quil2("multi1ans");
         quil3("multi2ans");
         quilleditor();
     } else if (selected == 'open') {
         container.html(`<div><label  for="name">Etykieta pytania</label>
                <input id="openname" type="text" name="name">                
                </div><div id="opencontent"></div>
                <button onclick="addopen()">Dodaj</button> <div id="err"></div>`);
         quil1("opencontent");
     } else if (selected == 'chapter') {
         container.html(`<div><label  for="name">Nazwa rodziału</label>
                <input id="chaptername" type="text" name="name">                
               </div> <div><label for="content">Opis rodziału</label>
                <input id="chaptercontent" type="text" name="content"></div>
                <button onclick="addchapter()">Dodaj</button> <div id="err"></div>`)
     }



 }




 function addpossibility() {
     let num = $(".num").length;
     if (num == 2) {
         $(`                <div class="num">
                <label class="a" for="single3"><input id="single3" type="radio" value="3" name="ans" checked>Trzecia odpowiedź</label>
                <div id="single3ans">
                </div>                
                </div>`).insertBefore('button#possibility');
         quil4("single3ans");
         quilleditor();
     }
     if (num == 3) {
         $(`                <div class="num">
                <label class="a" for="single4"><input id="single4" type="radio" value="4" name="ans" checked>Czwarta odpowiedź</label>
                <div id="single4ans">
                </div>                
                </div>`).insertBefore('button#possibility');
         quil5("single4ans");
         quilleditor();
     }
 }

 function addpossibility1() {
     let num = $(".num").length;
     if (num == 2) {
         $(`                <div class="num">
                <label class="a" for="multi3"><input id="multi3" type="checkbox" value="3" name="ans" checked>Trzecia odpowiedź</label>
                <div id="multi3ans">
                </div>                
                </div>`).insertBefore('button#possibility');
         quil4("multi3ans");
         quilleditor();
     }
     if (num == 3) {
         $(`                <div class="num">
                <label class="a" for="multi4"><input id="multi4" type="checkbox" value="4" name="ans" checked>Czwarta odpowiedź</label>
                <div id="multi4ans">
                </div>                
                </div>`).insertBefore('button#possibility');
         quil5("multi4ans");
         quilleditor();
     }
 }


 // NIE SPRAEDZONE!!!!
 function del(e) {
     if ($(".selectedcontent div").length - 2 == 4 && e.className == "third") {
         $(`<div class="third"><label for="third"><input id="third" type="radio" value="third" name="ans">Trzecia odpowiedź</label>
                <input class='a' id="thirdans" value="` + $("#fourthans").val() + `" type="text" name="third"><button onclick="del(this.parentElement)">Usuń</button>
                </div>`).insertBefore('button#possibility')
     }
     $(".fourth").remove();


     e.remove();
 }

 function del1(e) {
     if ($(".selectedcontent div").length - 2 == 4 && e.className == "third") {
         $(`<div class="third"><label for="third"><input id="third" type="checkbox" value="third" name="ans">Trzecia odpowiedź</label>
                <input class='a' id="thirdans" value="` + $("#fourthans").val() + `" type="text" name="third"><button onclick="del(this.parentElement)">Usuń</button>
                </div>`).insertBefore('button#possibility')
     }
     $(".fourth").remove();


     e.remove();
 }

 var toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        ['blockquote', 'code-block'],

        [{
         'header': 1
        }, {
         'header': 2
        }], // custom button values
        [{
         'list': 'ordered'
        }, {
         'list': 'bullet'
        }],
        [{
         'script': 'sub'
        }, {
         'script': 'super'
        }], // superscript/subscript
        [{
         'indent': '-1'
        }, {
         'indent': '+1'
        }], // outdent/indent
        [{
         'direction': 'rtl'
        }], // text direction

        [{
         'size': ['small', false, 'large', 'huge']
        }], // custom dropdown
        [{
         'header': [1, 2, 3, 4, 5, 6, false]
        }],

        [{
         'color': []
        }, {
         'background': []
        }], // dropdown with defaults from theme
        [{
         'font': []
        }],
        [{
         'align': []
        }],

        ['clean'] // remove formatting button
    ];



 function quilleditor() {
     let x = 0;
     let xi = 0;
     $(".ql-toolbar").each(function () {
         x++
         this.id = "quil" + x
     })
     $(".ql-editor").each(function () {
         xi++
         this.id = "uil" + xi;

         this.onclick = function () {
             $("#quil1").css('z-index', 10);
             $("#quil2").css('z-index', 1);
             $("#quil3").css('z-index', 2);
             $("#quil4").css('z-index', 3);
             $("#quil5").css('z-index', 4);
             $("#q" + this.id).css('z-index', 11);
             console.log("#q" + this.id)
         }
     })
 }





 function quil1(e) {
     var cont = document.getElementById(e)
     window.quill1 = new Quill(cont, {
         modules: {
             toolbar: toolbarOptions
         },
         theme: 'snow'
     });
 }

 function quil2(e) {
     var cont = document.getElementById(e)
     window.quill2 = new Quill(cont, {
         modules: {
             toolbar: toolbarOptions
         },
         theme: 'snow'
     });
 }

 function quil3(e) {
     var cont = document.getElementById(e)
     window.quill3 = new Quill(cont, {
         modules: {
             toolbar: toolbarOptions
         },
         theme: 'snow'
     });
 }

 function quil4(e) {
     var cont = document.getElementById(e)
     window.quill4 = new Quill(cont, {
         modules: {
             toolbar: toolbarOptions
         },
         theme: 'snow'
     });
 }

 function quil5(e) {
     var cont = document.getElementById(e)
     window.quill5 = new Quill(cont, {
         modules: {
             toolbar: toolbarOptions
         },
         theme: 'snow'
     });
 }
