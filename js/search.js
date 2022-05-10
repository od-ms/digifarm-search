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

  return projects;
}

function getProjectListHtml(projects = null) {
  if (projects === null) {
    projects = loadProjects();
  }

  let projectList = $('<ul class="list-group"></ul>');
  projects.forEach(function (project, key) {
    let projectData = "<h3 class='fs-5'>" + project.Name + "</h3>";
    if (project['Kurzbeschreibung']) {
      projectData += "<p>" + project['Kurzbeschreibung'] + "</p>";
    }
    projectData += "<dl class='row'>";
    const properties = ['Ursprung', 'Quelle', 'Kategorie', 'Komplexität', 'Technologien'];
    properties.forEach(function (property) {
      if (project[property]) {
        projectData += "<dt class='col-5 col-sm-4 col-md-3 col-xl-2 fw-normal'>" + property + ": " + "</dt>";
        projectData += "<dd class='col-7 col-sm-8 col-md-9 col-xl-10 project-attribute'>" + project[property] + "</dd>"
      }
    })
    projectData += "</ul>";
    if (project['Projekt-Url']) {
      projectData += "<p></p><a href='" + project['Projekt-Url'] + "' target=\"_blank\">Zum Projekt</a></p>";
    }
    projectList.append("<li class='list-group-item' id='" + key + "'>" + projectData + "</li>");
  });

  return projectList;
}

function filterData(filter, projects = null) {
  let filteredProjects;

  if (projects === null) {
    projects = loadProjects();
  }

  filteredProjects = projects.filter(project => project[filter.key].includes(filter.value));

  return filteredProjects;
}

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

  let $options = $('<select class="filterbox form-select" name="' + key + '" id="' + key + '"></select>');
  $options.append('<option value="" selected>Bitte auswählen</option>');
  projectValues.forEach(function (projectValue) {
    $options.append('<option value="' + projectValue + '">' + projectValue + '</option>');
  });

  return $options;
}

$().ready(function () {
  const projects = loadProjects();

  let projectList = getProjectListHtml(projects);
  $('.project-list').html(projectList);

  let originOptions = getSelectOptionsHTMLByKey('Ursprung');
  $('#origin-select').html(originOptions);

  let technologyOptions = getSelectOptionsHTMLByKey('Technologien');
  $('#technology-select').html(technologyOptions);

  let sourceOptions = getSelectOptionsHTMLByKey('Quelle');
  $('#source-select').html(sourceOptions);

  let categoryOptions = getSelectOptionsHTMLByKey('Kategorie');
  $('#category-select').html(categoryOptions);

  let complexityOptions = getSelectOptionsHTMLByKey('Komplexität');
  $('#complexity-select').html(complexityOptions);

  $('.filterbox').on('change', function (e) {
    $('.filterbox').not(this).prop('selectedIndex', 0);

    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;

    if (valueSelected) {
      filteredProjects = filterData({value: this.value, key: this.name})
    } else {
      filteredProjects = projects;
    }
    projectHtml = getProjectListHtml(filteredProjects);
    $('.project-list').html(projectHtml);
  });

  $('#filter-reset-button').on('click', function () {
    $('.filterbox').prop('selectedIndex', 0);
    projectHtml = getProjectListHtml(projects);
    $('.project-list').html(projectHtml);
  });
});
