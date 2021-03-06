import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, TeamGenerationPayload, 
    TeamGenerationResponseContainer, TeamGenerationResponse} from "../Models";
import {ProvisionHealthCheckContainer} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const PROVISION_DETAILS_HEADER = '#adminProvisionTeamsDetailsHeader';
const CLASS_SIZE = '#admin-prov-details__class-size-body';
const STUDENTS_WITH_TEAM = '#admin-prov-details__students-on-team-body';
const TEAMS_ALLOWED = '#admin-prov-details__teams-allowed-body';
const STUDENTS_WITHOUT_TEAM = '#admin-prov-details__students-without-team-body';
const TEAMS = '#admin-prov-details__students-num-of-teams-body';
const TEAMS_WITH_REPO = '#admin-prov-details__students-num-of-teams-with-repo-body';
const TEAMS_WITHOUT_REPO = '#admin-prov-details__students-num-of-teams-without-repo-body';
const HTML_CONTAINER = '#admin-prov-teams__details-container';
const GENERATE_TEAMS_ACTION = '#admin-prov-details__generate-teams';
const PROJECT_URL_PATH = 'githubState.repo.url';
const MIN_TEAM_SIZE = '#admin-prov-details__generate-teams-min-size';
const MAX_TEAM_SIZE = '#admin-prov-details__generate-teams-max-size';
const MIN_TEAM_SIZE_INPUT = '#admin-prov-details__min-team-size-input';
const MAX_TEAM_SIZE_INPUT = '#admin-prov-details__max-team-size-input';


declare var myApp: App;

export class TeamHealthView {
    private controller: AdminController;
    private deliverable: Deliverable;
    private teamsProvisioned: boolean;
    // private currentlyProvisioning: boolean; - not implemented on back-end properly.

    constructor(controller: AdminController, deliverable: Deliverable) {
        this.controller = controller;
        this.deliverable = deliverable;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector(PROVISION_DETAILS_HEADER).innerHTML = "Teams Overview: '" + String(this.deliverable.name) + "'";
    }

    public render(data: ProvisionHealthCheckContainer) {
        console.log('ProvisionTeamsDetailsView::render(..) - start - data: ' + JSON.stringify(data));
        UI.showModal();
        let that = this;
        let teamCount = 0;

          // let delivRow = UI.createListItem(deliverable.name, String(myApp.currentCourseId) + ' Deliverable', TAPPABLE_INTERFACE);
          // delivRow.onclick = function() {
          // that.viewDeliverableProvision(deliverable.name);
          console.log(data);
   

        UI.pushPage('html/admin/teamHealth.html', {data: null})
            .then(() => {
                that.updateTitle();

                let classSize = data.response.classSize;
                let studentsWithTeam = data.response.studentTeamStatus.studentsWithTeam;
                let teamsAllowed = data.response.teamsAllowed;
                let studentsWithoutTeam = data.response.studentTeamStatus.studentsWithoutTeam;
                let teams = data.response.teams;
                let numOfTeams = data.response.numOfTeams;
                let teamsWithRepo = data.response.numOfTeamsWithRepo;
                let teamsWithoutRepo = data.response.numOfTeamsWithoutRepo;
                // let minTeamSize = (document.querySelector(MIN_TEAM_SIZE) as HTMLInputElement).value = String(this.deliverable.minTeamSize);
                // let maxTeamSize = (document.querySelector(MAX_TEAM_SIZE) as HTMLInputElement).value = String(this.deliverable.maxTeamSize);

                (document.querySelector(STUDENTS_WITH_TEAM)).addEventListener('click', () => {
                    that.loadDetails(studentsWithTeam);
                });

                (document.querySelector(STUDENTS_WITHOUT_TEAM)).addEventListener('click', () => {
                    that.loadDetails(studentsWithoutTeam);
                });

                (document.querySelector(TEAMS)).addEventListener('click', () => {
                    that.loadDetails(teams);
                });

                (document.querySelector(TEAMS_WITH_REPO)).addEventListener('click', () => {
                    that.loadDetails(teamsWithRepo);
                });

                (document.querySelector(TEAMS_WITHOUT_REPO)).addEventListener('click', () => {
                    that.loadDetails(teamsWithoutRepo);
                });

                (document.querySelector(TEAMS_ALLOWED).firstChild as HTMLElement).innerHTML = teamsAllowed === true ? 'Yes' : 'No';
                (document.querySelector(CLASS_SIZE).firstChild as HTMLElement).innerHTML = classSize.toString();
                (document.querySelector(STUDENTS_WITH_TEAM).firstChild as HTMLElement).innerHTML = studentsWithTeam.length.toString();
                (document.querySelector(STUDENTS_WITHOUT_TEAM).firstChild as HTMLElement).innerHTML = studentsWithoutTeam.length.toString();
                (document.querySelector(TEAMS).firstChild as HTMLElement).innerHTML = numOfTeams.toString();
                (document.querySelector(TEAMS_WITH_REPO).firstChild as HTMLElement).innerHTML = teamsWithRepo.length.toString();
                (document.querySelector(TEAMS_WITHOUT_REPO).firstChild as HTMLElement).innerHTML = teamsWithoutRepo.length.toString();

                UI.hideModal();
        });
    }

    public loadDetails(data: object[]) {
        console.log('ProvisionTeamsDetailsView::loadDetails(..) - start - data: ' + JSON.stringify(data));

        let that = this;
        UI.showModal();

        UI.pushPage('html/admin/teamHealth.html', {data})
            .then(() => {
                let htmlContainer = document.querySelector('#admin-prov-teams__details-container');

                data.map((element: any) => {

                let header = UI.createListHeader(element.lname + ' ' + element.fname);

                // overrides for header for odd-ball object parsing
                if (typeof element.fname === 'undefined' && element.githubState !== 'undefined') {
                    header = UI.createListHeader(element.name)    ;
                }
                htmlContainer.appendChild(header);

                Object.keys(element).forEach((key) => {

                    let child = UI.createListItem(key, element[key], false);
                    let altElemText = '';

                    // overrides in case a populated field or more advance object needs text parsing
                    if (key === 'deliverableIds') {
                        Object.keys(element[key]).forEach((key_override) => {
                            altElemText+= element[key][key_override].name + ' ';
                        });
                    } else if (key === 'courseId') {
                        altElemText+= element[key].courseId + ' ';
                    } else if (key === 'members') {
                        Object.keys(element[key]).forEach((key_override) => {
                            altElemText+= '<p/>' + element[key][key_override].fname + ' ' + element[key][key_override].lname + 
                                ' (snum: ' + element[key][key_override].snum + ' / csid: ' + element[key][key_override].csid + ' / username: ' 
                                + element[key][key_override].username + ')';
                        });
                    } else if (key === 'githubState') {
                        altElemText = JSON.stringify(element[key]);
                        // also append project URL if available
                        if (typeof element[key].repo !== 'undefined' && typeof element[key].repo.url !== 'undefined') {
                            child = UI.createListItem(PROJECT_URL_PATH, element[key].repo.url, false);
                            htmlContainer.appendChild(child);
                        }
                    }

                    child = UI.createListItem(key, altElemText || element[key], false);
                    htmlContainer.appendChild(child);
                    });
                });

                that.updateTitle();
            });
        UI.hideModal();

        console.log('ProvisionTeamsDetailsView::loadDetails(..) - end');
    }


}