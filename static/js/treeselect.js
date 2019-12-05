 function navselect(){
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
    function select(selected){
            let container = $(".selectedcontent");
            if(selected == 'single'){
                container.html(`               <div>
                <label  for="name">Etykieta pytania</label>
                <input id="singlename" type="text" name="name">  
                </div>              
                <div>
                <label for="content">Treść pytania</label>
                <input id="singlecontent" type="text" name="content">
                </div>
                <div>
                <label for="first"><input id="first" type="radio" value="first" name="ans" checked>Pierwsza odpowiedź</label>
                <input class='a' id="firstans" type="text" name="first"> 
                </div>
                <div>
                <label for="second"><input type="radio" id="second" value="second" name="ans">Druga odpowiedź</label>
                <input class='a' id="secondans" type="text" name="second"> 
                </div>
                <button id='possibility' onclick="addpossibility()">Dodaj możliwą odpowiedź</button>
                <button onclick="addsingle()">Dodaj</button>`);
            } else if(selected == 'multi'){
                container.html(`               <div>
                <label  for="name">Etykieta pytania</label>
                <input id="multiname" type="text" name="name">  
                </div>              
                <div>
                <label for="content">Treść pytania</label>
                <input id="multicontent" type="text" name="content">
                </div>
                <div>
                <label for="first"><input id="first" type="checkbox" value="first" name="ans" checked>Pierwsza odpowiedź</label>
                <input class='a' id="firstans" type="text" name="first"> 
                </div>
                <div>
                <label for="second"><input type="checkbox" id="second" value="second" name="ans">Druga odpowiedź</label>
                <input class='a' id="secondans" type="text" name="second"> 
                </div>
                <button id='possibility' onclick="addpossibility1()">Dodaj możliwą odpowiedź</button>
                <button onclick="addmulti()">Dodaj</button>`);
            } else if(selected == 'open'){
                container.html(`<div><label  for="name">Etykieta pytania</label>
                <input id="openname" type="text" name="name">                
                </div><div><label for="content">Treść pytania</label>
                <input id="opencontent" type="text" name="content"></div>
                <button onclick="addopen()">Dodaj</button>`);
            } else if(selected == 'chapter'){
                container.html(`<div><label  for="name">Nazwa rodziału</label>
                <input id="chaptername" type="text" name="name">                
               </div> <div><label for="content">Opis rodziału</label>
                <input id="chaptercontent" type="text" name="content"></div>
                <button onclick="addchapter()">Dodaj</button>`)                
            }
                
                
                
            }
                
                
    function addpossibility(){
        let num = $(".selectedcontent div").length-2;
        if(num==2){
            $(`               <div class="third"><label for="third"><input id="third" type="radio" value="third" name="ans">Trzecia odpowiedź </label>
                <input class='a' id="thirdans" type="text" name="third"><button onclick="del(this.parentElement)">Usuń</button>
                </div>`).insertBefore('button#possibility')
        }
        if(num==3){
                        $(`<div class="fourth"><label for="fourth"><input  id="fourth" type="radio" value="fourth" name="ans">Czwarta odpowiedź</label>
                <input class='a' id="fourthans" type="text" name="third"><button onclick="del(this.parentElement)">Usuń</button>
                </div>`).insertBefore('button#possibility')
        }
    }

        function addpossibility1(){
        let num = $(".selectedcontent div").length-2;
        if(num==2){
            $(`               <div class="third"><label for="third"><input id="third" type="checkbox" value="third" name="ans">Trzecia odpowiedź </label>
                <input class='a' id="thirdans" type="text" name="third"><button onclick="del1(this.parentElement)">Usuń</button>
                </div>`).insertBefore('button#possibility')
        }
        if(num==3){
                        $(`<div class="fourth"><label for="fourth"><input  id="fourth" type="checkbox" value="fourth" name="ans">Czwarta odpowiedź</label>
                <input class='a' id="fourthans" type="text" name="third"><button onclick="del1(this.parentElement)">Usuń</button>
                </div>`).insertBefore('button#possibility')
        }
    }

    function del(e){
        if($(".selectedcontent div").length-2==4&&e.className=="third"){
                        $(`<div class="third"><label for="third"><input id="third" type="radio" value="third" name="ans">Trzecia odpowiedź</label>
                <input class='a' id="thirdans" value="`+$("#fourthans").val()+`" type="text" name="third"><button onclick="del(this.parentElement)">Usuń</button>
                </div>`).insertBefore('button#possibility')
        }
            $(".fourth").remove();
            
        
        e.remove();
    }
    
        function del1(e){
        if($(".selectedcontent div").length-2==4&&e.className=="third"){
                        $(`<div class="third"><label for="third"><input id="third" type="checkbox" value="third" name="ans">Trzecia odpowiedź</label>
                <input class='a' id="thirdans" value="`+$("#fourthans").val()+`" type="text" name="third"><button onclick="del(this.parentElement)">Usuń</button>
                </div>`).insertBefore('button#possibility')
        }
            $(".fourth").remove();
            
        
        e.remove();
    }