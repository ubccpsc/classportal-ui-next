/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

myApp.controllers = {

    handleRemote: function (url, onSuccess, onError) {

        myApp.network.getData(url).then(function (data) {
            console.log('handleRemote; url: ' + url + '; data: ' + JSON.stringify(data));
            onSuccess(data);
        }).catch(function (err) {
            console.log('myApp.controllers::handleRemote ERROR; url: ' + url + '; msg: ' + err);
            onError(err);
        });
    },

    handleError: function (err) {
        if (err instanceof Error) {
            ons.notification.alert(err.message);
        } else {
            ons.notification.alert(err);
        }
    },

    adminTabsPage: function (page) {
        var opts = page.pushedOptions;
        console.log('myApp.controllers::adminTabPage - start: ' + JSON.stringify(opts));

        myApp.controllers.adminCourseId = opts.course; // HACK: global
    },


    adminDeliverablesPage: function (page) {
        console.log('myApp.controllers::adminDeliverablesPage - start');

        var course = myApp.controllers.adminCourseId; // HACK: global

        if (course === 'admin310') {
            myApp.controllers.handleRemote('https://FILLMEIN/admin/310/deliverables', myApp.controllers.populateAdminDeliverablesPage, myApp.controllers.handleError);
        } else {
            console.log('adminDeliverablesPage - unknown course: ' + course);
        }
    },

    adminTeamsPage: function (page) {
        console.log('myApp.controllers::adminTeamsPage - start');

        var course = myApp.controllers.adminCourseId; // HACK: global

        if (course === 'admin310') {
            myApp.controllers.handleRemote('https://FILLMEIN/admin/310/teams', myApp.controllers.populateAdminTeamsPage, myApp.controllers.handleError);
        } else {
            console.log('adminTeamsPage - unknown course: ' + course);
        }
    },

    adminGradesPage: function (page) {
        console.log('myApp.controllers::adminGradesPage - start');

        var course = myApp.controllers.adminCourseId; // HACK: global

        if (course === 'admin310') {
            myApp.controllers.handleRemote('https://FILLMEIN/admin/310/grades', myApp.controllers.populateAdminGradesPage, myApp.controllers.handleError);
        } else {
            console.log('adminGradesPage - unknown course: ' + course);
        }
    },

    adminDashboardPage: function (page) {
        console.log('myApp.controllers::adminDashboardPage - start');

        var course = myApp.controllers.adminCourseId; // HACK: global

        if (course === 'admin310') {
            myApp.controllers.handleRemote('https://FILLMEIN/admin/310/dashboard', myApp.controllers.populateAdminDashboardPage, myApp.controllers.handleError);
        } else {
            console.log('adminDashboardPage - unknown course: ' + course);
        }
    },

    studentTabsPage: function (page) {
        var opts = page.pushedOptions;
        console.log('myApp.controllers::studentsTabPage - start: ' + JSON.stringify(opts));

        if (opts.course === 'cpsc210') {
            myApp.controllers.handleRemote('https://FILLMEIN/student/210/rtholmes', myApp.controllers.populateStudentTabs, myApp.controllers.handleError);
        } else if (opts.course === 'cpsc310') {
            myApp.controllers.handleRemote('https://FILLMEIN/student/310/rtholmes', myApp.controllers.populateStudentTabs, myApp.controllers.handleError);
        } else {
            console.log('studentTabsPage - unknown course: ' + opts.course);
        }

    },

    populateAdminDeliverablesPage: function (data) {
        console.log('myApp.controllers::populateAdminDeliverablesPage - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        // deliverables
        var deliverableList = document.querySelector('#admin-deliverable-list');
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            for (var i = 0; i < data.deliverables.length; i++) {
                var deliverable = data.deliverables[i];
                deliverableList.appendChild(createListHeader(deliverable.id));
                deliverableList.appendChild(createListItem("Open: " + deliverable.open));
                deliverableList.appendChild(createListItem("Close: " + deliverable.open));
                deliverableList.appendChild(createListItem("Scheme: " + deliverable.scheme));
            }
        } else {
            console.log('myApp.controllers::populateAdminDeliverablesPage - element is null');
        }
    },

    populateAdminTeamsPage: function (data) {
        console.log('myApp.controllers::populateAdminTeamsPage - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        try {
            // teams
            var teamsList = document.querySelector('#admin-team-list');
            if (teamsList !== null) {
                teamsList.innerHTML = '';
                for (var i = 0; i < data.deliverables.length; i++) {
                    var deliverable = data.deliverables[i];
                    teamsList.appendChild(createListHeader(deliverable.id));
                    if (deliverable.unassigned.length > 0) {
                        teamsList.appendChild(createListHeader('Unassigned Students'));

                        for (var j = 0; j < deliverable.unassigned.length; j++) {
                            teamsList.appendChild(createListItem(deliverable.unassigned[j]));
                        }
                    }
                    if (deliverable.teams.length > 0) {
                        teamsList.appendChild(createListHeader('Assigned Students'));
                        for (var k = 0; k < deliverable.teams.length; k++) {
                            var team = deliverable.teams[k];
                            teamsList.appendChild(createListItem(team.id, 'Members: ' + JSON.stringify(team.members)));
                        }
                    }
                }
            } else {
                console.log('myApp.controllers::populateAdminTeamsPage - element is null');
            }
        } catch (err) {
            console.log('myApp.controllers::populateAdminTeamsPage - ERROR: ' + err);
        }
    },

    populateAdminGradesPage: function (data) {
        console.log('myApp.controllers::populateAdminGradesPage - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        // grades
        var gradeList = document.querySelector('#admin-grade-list');
        if (gradeList !== null) {
            gradeList.innerHTML = '';

            var headers = null;

            var table = '<table style="width: 100%"><tr>';

            for (var i = 0; i < data.students.length; i++) {
                var student = data.students[i];

                if (headers === null) {
                    table += '<th style="text-align:left;">Student</th>';
                    for (var j = 0; j < student.deliverables.length; j++) {
                        var deliv = student.deliverables[j];
                        if (typeof deliv.final !== 'undefined') {
                            table += '<th>' + deliv.id + '</th>'
                        }
                    }
                    table += '</tr>';
                    headers = true;
                }

                table += '<tr>';
                table += '<td>' + student.id + '</td>';
                for (var k = 0; k < student.deliverables.length; k++) {
                    var deliv = student.deliverables[k];
                    if (typeof deliv.final !== 'undefined') {
                        table += '<td style="text-align: center;">' + deliv.final + '</td>'
                    }
                }
                table += '</tr>';
            }
            table += '</table>';

            gradeList.innerHTML = table;
        } else {
            console.log('myApp.controllers::populateAdminGradePage - element is null');
        }
    },

    populateAdminDashboardPage: function (data) {
        console.log('myApp.controllers::populateAdminDashboardPage - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        // deliverables
        var dashList = document.querySelector('#admin-dashboard-list');
        if (dashList !== null) {
            dashList.innerHTML = '';
            for (var i = 0; i < data.rows.length; i++) {
                var row = data.rows[i];
                // dashList.appendChild(createListHeader(deliverable.id));
                dashList.appendChild(createListItem(row.team + ' ( ' + row.final + ' )', JSON.stringify(row.passing)));
            }
        } else {
            console.log('myApp.controllers::populateAdminDashboardPage - element is null');
        }
    },

    populateStudentTabs: function (data) {
        myApp.controllers.studentData = data; // HACK: global
        document.querySelector('#studentTabsHeader').innerHTML = data.course;

        myApp.controllers.updateStudentData(data);
    },

    updateStudentData: function (data) {

        try {
            document.querySelector('#studentTabsHeader').innerHTML = data.course;

            // crude check to see if tabs are ready
            var studentList = document.querySelector('#student-overview-list');
            if (studentList !== null) {

                // overview
                studentList.appendChild(createListHeader('Name'));
                studentList.appendChild(createListItem(data.name));

                studentList.appendChild(createListHeader('CWL'));
                studentList.appendChild(createListItem(data.cwl));

                studentList.appendChild(createListHeader('Lab'));
                studentList.appendChild(createListItem(data.lab));

                // deliverables
                var deliverableList = document.querySelector('#student-deliverable-list');
                for (var i = 0; i < data.deliverables.length; i++) {
                    var deliverable = data.deliverables[i];
                    deliverableList.appendChild(createListItem(deliverable.id, deliverable.due));
                }

                // teams
                var teamList = document.querySelector('#student-team-list');
                for (var i = 0; i < data.teams.length; i++) {
                    var team = data.teams[i];
                    if (typeof team.msg !== 'undefined') {
                        teamList.appendChild(createListItem(team.id, team.msg));
                    } else {
                        teamList.appendChild(createListItem(team.id, JSON.stringify(team.members)));
                    }
                }

                // grades
                var gradeList = document.querySelector('#student-grade-list');
                for (var i = 0; i < data.grades.length; i++) {
                    var grade = data.grades[i];
                    gradeList.appendChild(createListHeader(grade.id));
                    if (typeof grade.msg !== 'undefined') {
                        gradeList.appendChild(createListItem(grade.msg));
                    } else {
                        gradeList.appendChild(createListItem('Final Grade: ' + grade.final));
                        if (grade.test) {
                            gradeList.appendChild(createListItem('Test Grade: ' + grade.test));
                        }
                        if (grade.cover) {
                            gradeList.appendChild(createListItem('Coverage Grade: ' + grade.cover));
                        }
                    }
                }

                return true;
            }
        } catch (err) {
            console.log('updateStudentData failed: ' + err);
        }
        return false;
    }


}; // myApp.controllers

