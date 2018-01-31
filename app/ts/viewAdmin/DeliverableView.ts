import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {DeliverablePayload, DeliverablePayloadContainer} from "../Models";
import {App} from "../App";

const flatpickr: any = require('flatpickr');
const OPEN_DELIV_KEY = '#open';
const CLOSE_DELIV_KEY = '#close';
const START_CODE_URL = '#url';
const DELIV_NAME = '#name';
const MIN_TEAM_SIZE = '#minTeamSize';
const MAX_TEAM_SIZE = '#maxTeamSize';
const MUST_BE_IN_SAME_LAB = '#inSameLab';
const STUDENTS_MAKE_TEAMS = '#studentsMakeTeams';
const GRADES_RELEASED = '#gradesReleased';
const PROJECT_COUNT = '#projectCount';

declare var myApp: App;

export class DeliverableView {
    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Deliverables";
    }

    public render(data: DeliverablePayloadContainer) {
        console.log('DeliverableView::render(..) - start');
        this.updateTitle();

        if (typeof data === 'undefined') {
            console.log('DeliverableView::render(..) - data is undefined');
            return;
        }
        console.log('DeliverableView::render(..) - data: ' + JSON.stringify(data));

        let deliverables = data.response;
        const customSort = function (a: DeliverablePayload, b: DeliverablePayload) {
            return (Number(a.id.match(/(\d+)/g)[0]) - Number((b.id.match(/(\d+)/g)[0])));
        };
        deliverables = deliverables.sort(customSort);

        console.log('DeliverableView::render(..) - setting deliverables: ' + JSON.stringify(deliverables));
        this.controller.deliverables = deliverables; // HACK: global

        const that = this;
        // deliverables
        const deliverableList = document.querySelector('#adminConfigDeliverablesPage-deliv-list');
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            if (deliverables.length > 0) {
                for (let deliverable of deliverables) {
                    const close = new Date(deliverable.close);
                    const open = new Date(deliverable.open);
                    deliverableList.appendChild(UI.createListHeader(deliverable.id));
                    let text = "Open: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString() + "; Close: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString();
                    let subtext = 'Subtext';
                    let elem = UI.createListItem(text, subtext, true);
                    elem.onclick = function () {
                        that.editDeliverable(deliverable);
                    };
                    deliverableList.appendChild(elem);
                    // deliverableList.appendChild(UI.createListItem("Close: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString()));
                }
            } else {
                deliverableList.appendChild(UI.createListItem("No deliverable data returned from server."));
            }
        } else {
            console.log('DeliverableView::render() - element is null');
        }
        UI.hideModal();
    }

    private editDeliverable(deliverable: DeliverablePayload) {
        console.log('DeliverableView::editDeliverable( ' + deliverable.id + ' ) - start');
        UI.showModal();
        UI.pushPage('html/admin/editDeliverable.html', {data: deliverable})
            .then(() => {
                let starterCode: HTMLInputElement = document.querySelector(START_CODE_URL) as HTMLInputElement;
                starterCode.value = deliverable.url;

                let delivName: HTMLInputElement = document.querySelector(DELIV_NAME) as HTMLInputElement;
                delivName.value = deliverable.name;

                try {
                    let dateFilter = flatpickr("#open", {
                        enableTime:  true,
                        time_24hr:   true,
                        utc: true,
                        dateFormat:  "Y/m/d @ H:i",
                        defaultDate: new Date(deliverable.open)
                    });

                    console.log('ResultView::configure() - done');
                } catch (err) {
                    console.error('ResultView::configure() - flatpickr ERROR: ' + err.message);
                }

                try {
                    let dateFilter = flatpickr("#close", {
                        enableTime:  true,
                        time_24hr:   true,
                        utc: true,
                        dateFormat:  "Y/m/d @ H:i",
                        defaultDate: new Date(deliverable.close)
                    });

                    console.log('ResultView::configure() - done');
                } catch (err) {
                    console.error('ResultView::configure() - flatpickr ERROR: ' + err.message);
                }

                let minTeamSize: HTMLInputElement = document.querySelector(MIN_TEAM_SIZE) as HTMLInputElement;
                minTeamSize.value = String(deliverable.minTeamSize);

                let maxTeamSize: HTMLInputElement = document.querySelector(MAX_TEAM_SIZE) as HTMLInputElement;
                maxTeamSize.value = String(deliverable.maxTeamSize);

                let mustBeInSameLab: HTMLInputElement = document.querySelector(MUST_BE_IN_SAME_LAB) as HTMLInputElement;
                mustBeInSameLab.value = deliverable.teamsInSameLab === true ? 'true' : 'false';

                let studentsMakeTeams: HTMLInputElement = document.querySelector(STUDENTS_MAKE_TEAMS) as HTMLInputElement;
                studentsMakeTeams.value = deliverable.studentsMakeTeams === true ? 'true' : 'false';

                let gradesReleased: HTMLInputElement = document.querySelector(GRADES_RELEASED) as HTMLInputElement;
                gradesReleased.value = deliverable.gradesReleased === true ? 'true' : 'false';

                let projectCount: HTMLInputElement = document.querySelector(PROJECT_COUNT) as HTMLInputElement;
                projectCount.value = String(deliverable.projectCount);

                // TODO: update to use the ids in the HTML file and populate values from there (except for the date, that will need to be moved over)

                /*
                let editableDeliv = document.querySelector('#admin-editable-deliverable-list') || document.querySelector('#admin-manage-deliverables');
                editableDeliv.innerHTML = '';

                let header = UI.createListHeader('Deliverable ' + deliverable.id);
                let elements = UI.createEditableDeliverable(deliverable);

                editableDeliv.appendChild(header);
                editableDeliv.appendChild(elements);

                let closeDefault = document.getElementById('close') as HTMLInputElement;
                let openDefault = document.getElementById('open') as HTMLInputElement;

                try {
                    let dateFilter = flatpickr("#close", {
                        enableTime:  true,
                        time_24hr:   true,
                        utc: true,
                        dateFormat:  "Y/m/d @ H:i",
                        defaultDate: new Date(parseInt(closeDefault.value))
                    });

                    console.log('ResultView::configure() - done');
                } catch (err) {
                    console.error('ResultView::configure() - flatpickr ERROR: ' + err.message);
                }

                try {
                    let dateFilter = flatpickr("#open", {
                        enableTime:  true,
                        time_24hr:   true,
                        utc: true,
                        dateFormat:  "Y/m/d @ H:i",
                        defaultDate: new Date(parseInt(openDefault.value))
                    });

                    console.log('ResultView::configure() - done');
                } catch (err) {
                    console.error('ResultView::configure() - flatpickr ERROR: ' + err.message);
                }
                */
                UI.hideModal();
            });
    }

}