const tree = document.getElementById("tree");

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
                    `"title="` +
                    question.content +
                    `"draggable="true" ondragstart="drag(event)">
      <span class="icon"> <i class="fas fa-calendar-minus"></i> </span
      >` +
                    question.name +
                    `</p>`;
            } else if (question.type == "single") {
                `<p class="list-item" id="` +
                question._id +
                    `"title="` +
                    question.content +
                    `"draggable="true" ondragstart="drag(event)">
      <span class="icon"> <i class="fas fa-calendar-check"></i> </span
      >` +
                    question.name +
                    `</p>`;
            } else if (question.type == "multi") {
                tree +=
                    `<p class="list-item" id="` +
                    question._id +
                    `"title="` +
                    question.content +
                    `"draggable="true" ondragstart="drag(event)">
        <span class="icon"> <i class="fas fa-calendar-alt"></i> </span
        >` +
                    question.name +
                    `</p>`;
            }
        }
    });
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
                `"title="` +
                question.content +
                `" draggable = 'true' ondragstart="drag(event)">
      <span class="icon"> <i class="fas fa-calendar-minus"></i> </span
      >` +
                question.name +
                `</p>`;
        } else if (question.type == "single") {
            tree +=
                `<p class="list-item" id="` +
                question._id +
                `"title="` +
                question.content +
                `" draggable = 'true' ondragstart="drag(event)">
      <span class="icon"> <i class="fas fa-calendar-check"></i> </span
      >` +
                question.name +
                `</p>`;
        } else if (question.type == "multi") {
            tree +=
                `<p class="list-item" id="` +
                question._id +
                `"title="` +
                question.content +
                `" draggable = 'true' ondragstart="drag(event)">
        <span class="icon"> <i class="fas fa-calendar-alt"></i> </span
        >` +
                question.name +
                `</p>`;
        }
    });
    return tree;
};

const generateTree = (chaptersList, questionsList) => {
    const chapters = chaptersList;
    const questions = questionsList;
    tree.innerHTML = "";
    Array.from(chapters).forEach(chapter => {
        const chapterQuestions = chapter.questions;
        let tempInner =
            `<div class='dir list-item' id="` +
            chapter._id +
            `"ondrop="drop(event, this)" ondragover="allowDrop(event)">
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
    });

    let tempInner =
        `
    <div class='dir list-item' id="unassigned">
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
    const treeElements = tree.getElementsByClassName("dir");
    for (let i = 1; i <= treeElements.length; i++) {
        const treeElement = treeElements[i - 1];
        const treeElementHeader = treeElement.querySelector("div.dir-header");
        const treeElementItems = treeElement.querySelector("div.dir-items");
        treeElementHeader.addEventListener("click", () => {
            treeElement.classList.toggle("opened-item");
            treeElementItems;
            if (treeElementItems.clientHeight) {
                treeElementItems.style.height = 0;
            } else {
                var wrapper = treeElementItems.querySelector("div.dir-items-wrapper");
                treeElementItems.style.height = wrapper.clientHeight + "px";
            }
        });
    }
};
