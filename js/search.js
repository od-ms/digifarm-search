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
    projectData += "<ul>";
    const properties = ['Ursprung', 'Quelle', 'Kategorie', 'Komplexität', 'Technologien'];
    properties.forEach(function (property) {
      if (project[property]) {
        projectData += "<li>" + property + ": " + project[property] + "</li>"
      }
    })
    projectData += "</ul>";
    if (project['Projekt-Url']) {
      projectData += "<p></p><a href='" + project['Projekt-Url'] + "'>Zum Projekt</a></p>";
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
});
