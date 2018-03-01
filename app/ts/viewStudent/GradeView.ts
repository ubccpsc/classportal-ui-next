import {UI} from "../util/UI";
import {App} from "../App";
import {Network} from "../util/Network";
import {OnsPopoverElement} from "onsenui";
import {GradeContainer, Grade} from '../Models';
import {StudentController} from "../controllers/StudentController";

const GRADE_ROW_HEADERS_CONTAINER = '#studentGradePage__listContainer';
const GRADE_ROW_HEADERS = '#studentGradePage__rowHeaders';

// ### STUDENT GRADE VIEW ### 

export class GradeView {

    private controller: StudentController;
    private app: App;
    private courseId: string;

    constructor(controller: StudentController, courseId: string, app: App) {
        console.log('/student/GradeView::<init>() - start');
        this.controller = controller;
        this.app = app;
        this.courseId = courseId;
    }

    public render(data: GradeContainer): void {
        console.log('/student/GradeView::render() - start ' + JSON.stringify(data));
        let that = this;
        const studentGradeContainer = document.querySelector(GRADE_ROW_HEADERS_CONTAINER);
        let rowHeaders = document.querySelector(GRADE_ROW_HEADERS) as HTMLElement;
        studentGradeContainer.innerHTML = '';
        studentGradeContainer.appendChild(rowHeaders);

        // this.addModalEventListener();
        
        studentGradeContainer.appendChild(UI.ons.createElement('<p>'));

        data.response.map((grade: Grade) => {

          let row = '<ons-row>' + 
            '<ons-col>' + grade.deliverable + '</ons-col>' +
            '<ons-col><a title="Grade comment info." href="#" id="test" data-comment="' + grade.comments + '">' + grade.grade + '</a></ons-col>' +
            '</ons-row>';
          let htmlRow = UI.ons.createElement(row);  
                        console.log(htmlRow.childNodes[1].firstChild);

          htmlRow.childNodes[1].firstChild.addEventListener('click', (e: MouseEvent) => {
              let popoverMessage: string = htmlRow.childNodes[1].firstChild.dataset.comment;
              UI.showPopover(e, popoverMessage);
          });

          console.log(htmlRow.childNodes[1].firstChild.dataset.comment);
          studentGradeContainer.appendChild(htmlRow);
        });
    }

}