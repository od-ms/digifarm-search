/**
 * Loads the project list from the data directory.
 *
 * @returns {Object} projects
 */
function loadProjects() {
  $.ajax({
    type: 'GET',
    url: "data/digifarm.json",
    dataType: 'json',
    success: function (data) {
      projects = data;
    },
    async: false
  });

  console.log(typeof projects);
  return projects;
}

/**
 * Get the prepared project list as HTML Element.
 *
 * @param {Object} projects
 * @returns {jQuery|HTMLElement} projectList
 */
function getProjectListHtml(projects = null) {
  if (projects === null) {
    projects = loadProjects();
  }

  let projectList = $('<ul class="list-group"></ul>');
  projects.forEach(function (project, key) {
    let projectData = '<h3 class="fs-5">' + project.Name + "</h3>";
    if (project['Kurzbeschreibung']) {
      projectData += "<p>" + project['Kurzbeschreibung'] + "</p>";
    }
    projectData += '<dl class="row">';
    const properties = ['Ursprung', 'Typ', 'Kategorie', 'Komplexität', 'Technologien'];
    properties.forEach(function (property) {
      if (project[property]) {
        projectData += '<dt class="col-5 col-sm-4 col-md-3 col-xl-2 fw-normal">'
          + property + ": " + "</dt>";
        projectData += '<dd class="col-7 col-sm-8 col-md-9 col-xl-10 project-attribute">'
          + project[property] + "</dd>"
      }
    })
    helpNeeded = '';
    if (!project['Technik']) {
      helpNeeded += '<span class="badge me-1 text-bg-secondary">Technik</span>'
    }
    if (!project['Inhalt']) {
      helpNeeded += '<span class="badge me-1 text-bg-secondary">Inhalt</span>'
    }
    if (!project['Sponsor']) {
      helpNeeded += '<span class="badge me-1 text-bg-secondary">Sponsor</span>'
    }
    projectData += '<dt class="col-5 col-sm-4 col-md-3 col-xl-2 fw-normal">Hilfe benötigt:</dt>'
      +'<dd class="col-7 col-sm-8 col-md-9 col-xl-10 project-attribute">' + (helpNeeded || 'keine') + '</dd>';
    projectData += "</ul>";
    if (project['Projekt-Url']) {
      projectData += '<p></p><a href="' + project['Digifarm-Url']
        + '" target="_top">Zum Projekt</a></p>';
    }
    projectList.append("<li class='list-group-item' id='" + key + "'>" + projectData + "</li>");
  });

  return projectList;
}

/**
 * Filter the project list by a given filter.
 *
 * @param {array} filter
 * @param {Object} projects
 * @returns {Object} filteredProjects
 */
function filterData(filter, projects = null) {
  let filteredProjects;

  if (projects === null) {
    projects = loadProjects();
  }

  filteredProjects = projects.filter(project => project[filter.key].includes(filter.value));

  return filteredProjects;
}

/**
 * Get the options elements for a given key from the project list.
 *
 * @param {string} key
 * @param {Object} projects
 * @returns {jQuery|HTMLElement} $options
 */
function getSelectOptionsHTMLByKey(key, projects = null) {
  if (projects === null) {
    projects = loadProjects();
  }

  let projectValues = [];
  projects.forEach(function (project) {
    if (project[key]) {
      let stringValues = project[key].split(',');
      stringValues.forEach(function (stringValue) {
        stringValue = stringValue.trim();
        if (!projectValues.includes(stringValue)) {
          projectValues.push(stringValue);
        }
      })
    }
  })
  projectValues.sort();

  return getSelectBoxHTML(key, projectValues);
}

function getSelectBoxHTML(key, projectValues) {
  let $options = $('<select class="filterbox form-select" name="' + key + '" id="' + key + '"></select>');
  $options.append('<option value="" selected>Bitte auswählen</option>');
  projectValues.forEach(function (projectValue) {
    $options.append('<option value="' + projectValue + '">' + projectValue + '</option>');
  });
  return $options
}

const OPTION_SHOW_ALL = 'alle Hilfsgesuche';
const OPTION_SHOW_TECHNIK = 'Technik';
const OPTION_SHOW_INHALT = 'Inhalt';
const OPTION_SHOW_SPONSOR = 'Sponsoring';

$().ready(function () {

  // Load and add the project list to the template.
  const projects = loadProjects();
  let projectList = getProjectListHtml(projects);
  $('.project-list').html(projectList);

  // Get the select box options for filter elements by key.

  let helpOptions = getSelectBoxHTML('Hilfe', [OPTION_SHOW_INHALT, OPTION_SHOW_TECHNIK, OPTION_SHOW_SPONSOR, OPTION_SHOW_ALL]);
  $('#help-select').html(helpOptions);

  // "origin" is currently unused
  // let originOptions = getSelectOptionsHTMLByKey('Ursprung');
  // $('#origin-select').html(originOptions);

  let technologyOptions = getSelectOptionsHTMLByKey('Technologien');
  $('#technology-select').html(technologyOptions);

  // "source" is currently unused
  //let sourceOptions = getSelectOptionsHTMLByKey('Quelle');
  //$('#source-select').html(sourceOptions);

  let typeOptions = getSelectOptionsHTMLByKey('Typ');
  $('#type-select').html(typeOptions);

  let categoryOptions = getSelectOptionsHTMLByKey('Kategorie');
  $('#category-select').html(categoryOptions);

  let complexityOptions = getSelectOptionsHTMLByKey('Komplexität');
  $('#complexity-select').html(complexityOptions);

  // Update the project list when an filter option is select or not.
  $('.filterbox').on('change', function (e) {
    $('.filterbox').not(this).prop('selectedIndex', 0);

    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;

    console.debug("selected", this.name, optionSelected, valueSelected)

    if ((this.name == "Hilfe") && valueSelected) {
      if (valueSelected == OPTION_SHOW_ALL) {
        filteredProjects = projects.filter(function(project) { return project["Inhalt"] == "" || project["Sponsor"] == "" || project["Technik"] == "" } );
      } else if (valueSelected == OPTION_SHOW_TECHNIK) {
        filteredProjects = projects.filter(function(project) { return project["Technik"].trim() == "" } );
      } else if (valueSelected == OPTION_SHOW_SPONSOR) {
        filteredProjects = projects.filter(function(project) { return project["Sponsor"].trim() == "" } );
      } else if (valueSelected == OPTION_SHOW_INHALT) {
        filteredProjects = projects.filter(function(project) { return project["Inhalt"].trim() == "" } );
      } else {
        filteredProjects = projects;
      }
    }
    else if (valueSelected) {
      filteredProjects = filterData({value: this.value, key: this.name})
    } else {
      filteredProjects = projects;
    }
    console.debug('filteredProjects', filteredProjects)
    projectHtml = getProjectListHtml(filteredProjects);
    $('.project-list').html(projectHtml);
  });

  // Reset the project list if reset button is clicked.
  $('#filter-reset-button').on('click', function () {
    $('.filterbox').prop('selectedIndex', 0);
    projectHtml = getProjectListHtml(projects);
    $('.project-list').html(projectHtml);
  });
});
