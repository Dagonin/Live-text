const tree = document.getElementById("tree");
///////////////////// Pytania
const getChapterQuestions = (c, q) => {
    let elements = [];
    c.forEach(chapterQuestionId => {
        let pos = q
            .map(function (x) {
                return x._id;
            })
            .indexOf(chapterQuestionId);
        elements.push(q[pos]);
        q.splice(pos, 1);
    });

    return elements;
};

const generateTreeItems = (c, q) => {
    let tree = "";
    const chapterQuestions = getChapterQuestions(c, q);
    chapterQuestions.forEach(question => {
        
        if (question) {
                console.log(question)
            if (question.type == "open") {
                tree +=
                    `<p class="list-item" id="` +
                    question._id +
                    `"draggable="true"  >
      <span class="icon"> <i class="fas fa-calendar-minus"></i> </span
      >` +
                    question.name +
                    `</p>`;
            } else if (question.type == "single") {
                tree +=
                    `<p class="list-item" id="` +
                    question._id +
                    `"draggable="true" >
      <span class="icon"> <i class="fas fa-calendar-check"></i> </span
      >` +
                    question.name +
                    `</p>`;
            } else if (question.type == "multi") {
                tree +=
                    `<p class="list-item" id="` +
                    question._id +
                    `"draggable="true" >
        <span class="icon"> <i class="fas fa-calendar-alt"></i> </span
        >` +
                    question.name +
                    `</p>`;
            }else if (question.type == "match") {
            tree +=
                `<p class="list-item" id="` +
                question._id +
                `" draggable = 'true' >
        <span class="icon"> <i class="fas fa-calendar-alt"></i> </span
        >` +
                question.name +
                `</p>`;
        }
        }
    });
    unblock();
    return tree;
};

const generateUnassignedItems = q => {
    let tree = "";
    const chapterQuestions = q;
    chapterQuestions.forEach(question => {
        if (question.type == "open") {
            tree +=
                `<p class="list-item" id="` +
                question._id +
                `" draggable = 'true' >
      <span class="icon"> <i class="fas fa-calendar-minus"></i> </span
      >` +
                question.name +
                `</p>`;
        } else if (question.type == "single") {
            tree +=
                `<p class="list-item" id="` +
                question._id +
                `" draggable = 'true'  >
      <span class="icon"> <i class="fas fa-calendar-check"></i> </span
      >` +
                question.name +
                `</p>`;
        } else if (question.type == "multi") {
            tree +=
                `<p class="list-item" id="` +
                question._id +
                `" draggable = 'true' >
        <span class="icon"> <i class="fas fa-calendar-alt"></i> </span
        >` +
                question.name +
                `</p>`;
        }else if (question.type == "match") {
            tree +=
                `<p class="list-item" id="` +
                question._id +
                `" draggable = 'true' >
        <span class="icon"> <i class="fas fa-calendar-alt"></i> </span
        >` +
                question.name +
                `</p>`;
        }
    });
    unblock();
    return tree;
};

const generateTree = (chaptersList, questionsList) => {
    console.log(questionsList)
    const chapters = chaptersList;
    const questions = questionsList;
    tree.innerHTML = "";
    Array.from(chapters).forEach(chapter => {
        const chapterQuestions = chapter.questions;
        let tempInner =
            `<div class='dir cont list-item' id="` +
            chapter._id +
            `"ondrop="drop(event, this)" >
    <div class='dir-header' db-id=` +
            chapter._id +
            `>
      <span class='icon'><i class='fas fa-folder'></i></span> ` +
            chapter.name +
            `
      <span class='icon is-pulled-right arrow'
        ><i class='fas fa-angle-right'></i
      ></span>
    </div>
    <div class='dir-items'><div class="dir-items-wrapper">` +
            generateTreeItems(chapterQuestions, questions) +
            `</div></div></div>`;
        tree.innerHTML += tempInner;
        unblock();
    });

    let tempInner =
        `
      <div class='dir cont list-item' id="unassigned" ondrop="drop(event, this)" >
      <div class='dir-header'>
        <span class='icon'><i class='far fa-folder'></i></span> Nieprzypisane
        <span class='icon is-pulled-right arrow'><i class='fas fa-angle-right'></i></span>
      </div>
      <div class='dir-items'>
        <div class="dir-items-wrapper">` +
        generateUnassignedItems(questions) +
        `
        </div>
      </div>
    </div>`;
    tree.innerHTML += tempInner;
};

const setClickEventOnTreeItems = () => {
    unblock();
    const treeElements = tree.getElementsByClassName("dir");
    for (let i = 1; i <= treeElements.length; i++) {
        const treeElement = treeElements[i - 1];
        const treeElementHeader = treeElement.querySelector("div.dir-header");
        const treeElementItems = treeElement.querySelector("div.dir-items");
        if (treeElement.getAttribute('listener') != 'true') {
            treeElement.setAttribute('listener', 'true');
            treeElementHeader.addEventListener("click", () => {
                treeElement.classList.toggle("opened-item");
                wys(treeElementHeader);
                treeElementItems;
            });
        }
    }
};


function wys(e) {

    let did = $(e).attr("db-id");
    if (!did) {
        did = "unassigned";
    }
    if ($(e.parentElement).hasClass("opened-item")) {
        let h = $("#" + did + " .dir-items-wrapper p").length * 43;
        $("#" + did + " .dir-items").height(h)
    } else {
        $("#" + did + " .dir-items").height(0)
    }
}



