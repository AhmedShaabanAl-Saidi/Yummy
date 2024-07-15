$(document).ready(function () {
  // Initialize the search by name function
  searchFunction("s", "");
  Validation();

  // dark mode
  $(".slider").click(function () {
    $("body").toggleClass("light-mode");
    $("#darkModeToggle").prop("checked", function (index, oldPropertyValue) {
      return !oldPropertyValue;
    });
  });

  // Close the aside info
  $(".aside-close").click(function () {
    $(".aside-info").hide(500, function () {
      $(".aside-info li").hide(200);
    });
    $(".aside-close").fadeOut(500, function () {
      $(".aside-open").fadeIn();
    });
  });

  // Open the aside info
  $(".aside-open").click(function () {
    $(".aside-info").show(500);
    $(".aside-info li").each(function (index) {
      $(this)
        .delay((index + 1) * 100)
        .slideDown(500);
    });
    $(".aside-open").fadeOut(500, function () {
      $(".aside-close").fadeIn();
    });
  });
});

function handelAside() {
  $(".aside-info").hide(500);
  $(".aside-open").show();
  $(".aside-close").hide();
}

// Fetch data from the API
async function fetchData(url) {
  try {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null;
  }
}

// Display search results by name
async function searchFunction(type, inputValue) {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/search.php?${type}=${inputValue}`
  );
  if (data) displayInputValues(data);
}

// Display input values
function displayInputValues(response) {
  let box = ``;
  const maxMeals = Math.min(response.meals.length, 20);
  for (let i = 0; i < maxMeals; i++) {
    let meal = response.meals[i];
    box += `<div class="col-md-3 custom-col-md-3 custom-ms-auto">
              <div class="meal" data-id="${meal.idMeal}">
                <div class="recipes-img overflow-hidden position-relative rounded-2">
                  <img src="${meal.strMealThumb}" class="w-100" alt="recipes-img">
                  <div class="img-overly position-absolute d-flex justify-content-center align-items-center">
                    <h3 class="m-auto text-center">${meal.strMeal}</h3>
                  </div>
                </div>
              </div>
            </div>`;
  }

  $(".displaySearchedMeals").html(box);
  $(".displayMeals").html(box);

  $(".meal").click(function () {
    const id = $(this).data("id");
    displayRecipeById(id);
    $(".default-page").hide();
    $(".search").hide();
    $(".recipe").show();
  });
}

// Fetch and display recipe by ID
async function displayRecipeById(id) {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  if (data) displayRecipe(data);
}

// Display recipe details
function displayRecipe(response) {
  let meal = response.meals[0];
  let ingredients = "";
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients += `<li class="alert alert-info m-2 p-1">${
        meal[`strIngredient${i}`]
      } - ${meal[`strMeasure${i}`]}</li>`;
    }
  }

  let tags = meal.strTags
    ? meal.strTags
        .split(",")
        .map((tag) => `<li class="alert alert-danger m-2 p-1">${tag}</li>`)
        .join("")
    : "";

  let box = `<div class="col-md-4 custom-col-md-3 custom-ms-auto">
                <img src="${meal.strMealThumb}" class="w-100 rounded-2" alt="recipe-img">
                <h2 class="fw-bold mt-2 text-warning recipeName">${meal.strMeal}</h2>
              </div>
              <div class="col-md-8 custom-col-md-3 custom-ms-auto">
                <h2>Instructions</h2>
                <p>${meal.strInstructions}</p>
                <h3>Area : <span>${meal.strArea}</span></h3>
                <h3>Category : <span>${meal.strCategory}</span></h3>
                <h3>Recipes :</h3>
                <ul class="list-unstyled d-flex g-3 flex-wrap">
                  ${ingredients}
                </ul>
                <h3>Tags :</h3>
                <ul class="list-unstyled d-flex g-3 flex-wrap">
                  ${tags}
                </ul>
                <div class="recipe-buttons">
                  <a href="${meal.strSource}" target="_blank"><button class="btn btn-success">Source</button></a>
                  <a href="${meal.strYoutube}" target="_blank"><button class="btn btn-danger">Youtube</button></a>
                </div>
              </div>`;

  $(".displayRecipe").html(box);
}

// Event handler for aside menu items
$(".aside-info li").each(function (index) {
  $(this).click(function () {
    const sectionClass = [
      "search",
      "categories",
      "area",
      "ingredients",
      "contact",
    ];
    $(`.${sectionClass[index]}`).show().siblings().hide();
    setTimeout(function () {
      handelAside();
    }, 500);
    if (index === 0) {
      $(".displaySearchedMeals").hide();
      $(".searchByName").on("input", function () {
        $(".searchLoader").show();
        searchFunction("s", $(this).val());
        $(".displaySearchedMeals").fadeIn(500);
      });

      $(".searchByFirstLetter").on("input", function () {
        if (this.value.length > 1) {
          this.value = this.value.slice(0, 1);
        }
        $(".searchLoader").show();
        searchFunction("f", $(this).val());
        $(".displaySearchedMeals").fadeIn(500);
      });
    } else if (index === 1) {
      fetchAndDisplayCategories();
    } else if (index === 2) {
      fetchAndDisplayAreas();
    } else if (index === 3) {
      fetchAndDisplayIngredients();
    }
  });
});

// Fetch and display categories
async function fetchAndDisplayCategories() {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/categories.php`
  );
  if (data) displayCategories(data.categories);
}

// Display categories
function displayCategories(categories) {
  let box = ``;
  for (let i = 0; i < categories.length; i++) {
    let category = categories[i];
    box += `<div class="col-md-3 custom-col-md-3 custom-ms-auto">
              <div class="category" data-id="${category.strCategory}">
                <div class="category-img overflow-hidden position-relative rounded-2">
                  <img src="${
                    category.strCategoryThumb
                  }" class="w-100" alt="category-img">
                  <div class="img-overly position-absolute d-flex flex-column justify-content-center align-items-center text-center">
                    <h3>${category.strCategory}</h3>
                    <p>${category.strCategoryDescription
                      .split(" ")
                      .slice(0, 20)
                      .join(" ")}</p>
                  </div>
                </div>
              </div>
            </div>`;
  }
  $(".displayCategories").html(box);

  $(".category").click(function () {
    const category = $(this).data("id");
    displayMealsByCategory(category);
    $(".categories").hide();
    $(".default-page").show();
  });
}

// Fetch and display meals by category
async function displayMealsByCategory(category) {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
  );
  if (data) displayMeals(data.meals);
}

// Fetch and display areas
async function fetchAndDisplayAreas() {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/list.php?a=list`
  );
  if (data) displayAreas(data.meals);
}

// Display areas
function displayAreas(areas) {
  let box = ``;
  for (let i = 0; i < areas.length; i++) {
    let area = areas[i];
    box += `<div class="col-md-3 custom-col-md-3 custom-ms-auto">
              <div class="area bg-dark pt-2 rounded-3 d-flex flex-column justify-content-center align-items-center text-center" id="area">
                <div class="inner" data-id="${area.strArea}">
                  <i class="fa-solid fa-house-laptop fa-4x"></i>
                  <h3>${area.strArea}</h3>
                </div>
              </div>
            </div>`;
  }
  $(".displayAreas").html(box);

  $(".inner").click(function () {
    const area = $(this).data("id");
    displayMealsByArea(area);
    $(".area").hide();
    $(".default-page").show();
  });
}

// Fetch and display meals by area
async function displayMealsByArea(area) {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
  );
  if (data) displayMeals(data.meals);
}

// Fetch and display ingredients
async function fetchAndDisplayIngredients() {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/list.php?i=list`
  );
  if (data) displayIngredients(data.meals);
}

// Display ingredients
function displayIngredients(ingredients) {
  let box = ``;
  const maxMeals = Math.min(ingredients.length, 20);
  for (let i = 0; i < maxMeals; i++) {
    let ingredient = ingredients[i];
    box += `<div class="col-md-3 custom-col-md-3 custom-ms-auto">
              <div class="ingredient bg-dark p-2 rounded-3 h-100 text-center" id="ingredient">
                <div class="inner" data-id="${ingredient.strIngredient}">
                  <i class="fa-solid fa-drumstick-bite fa-4x"></i>
                  <h3>${ingredient.strIngredient}</h3>
                  <p>${
                    ingredient.strDescription
                      .split(" ")
                      .slice(0, 20)
                      .join(" ") || "No description available"
                  }</p>
                </div>
              </div>
            </div>`;
  }
  $(".displayIngredients").html(box);

  $(".inner").click(function () {
    const ingredient = $(this).data("id");
    displayMealsByIngredient(ingredient);
    $(".ingredients").hide();
    $(".default-page").show();
  });
}

// Fetch and display meals by ingredient
async function displayMealsByIngredient(ingredient) {
  const data = await fetchData(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
  );
  if (data) displayMeals(data.meals);
}

// Display meals
function displayMeals(meals) {
  let box = ``;
  const maxMeals = Math.min(meals.length, 20);
  for (let i = 0; i < maxMeals; i++) {
    let meal = meals[i];
    box += `<div class="col-md-3 custom-col-md-3 custom-ms-auto">
              <div class="meal" data-id="${meal.idMeal}">
                <div class="recipes-img overflow-hidden position-relative rounded-2">
                  <img src="${meal.strMealThumb}" class="w-100" alt="recipes-img">
                  <div class="img-overly position-absolute d-flex justify-content-center align-items-center">
                    <h3 class="m-auto text-center">${meal.strMeal}</h3>
                  </div>
                </div>
              </div>
            </div>`;
  }
  $(".displayMeals").html(box);

  $(".meal").click(function () {
    const id = $(this).data("id");
    displayRecipeById(id);
    $(".default-page").hide();
    $(".recipe").show();
  });
}

// validation
let nameInputTouched = false;
let emailInputTouched = false;
let phoneInputTouched = false;
let ageInputTouched = false;
let passwordInputTouched = false;
let repasswordInputTouched = false;

function Validation() {
  $(".inputName").keyup(function () {
    nameInputTouched = true;
    inputsValidation();
  });

  $(".inputEmail").keyup(function () {
    emailInputTouched = true;
    inputsValidation();
  });

  $(".inputPhone").keyup(function () {
    phoneInputTouched = true;
    inputsValidation();
  });

  $(".inputAge").keyup(function () {
    ageInputTouched = true;
    inputsValidation();
  });

  $(".inputPassword").keyup(function () {
    passwordInputTouched = true;
    inputsValidation();
  });

  $(".inputRepassword").keyup(function () {
    repasswordInputTouched = true;
    inputsValidation();
  });

  $(".inputName").focus(function () {
    nameInputTouched = true;
  });

  $(".inputEmail").focus(function () {
    emailInputTouched = true;
  });

  $(".inputPhone").focus(function () {
    phoneInputTouched = true;
  });

  $(".inputAge").focus(function () {
    ageInputTouched = true;
  });

  $(".inputPassword").focus(function () {
    passwordInputTouched = true;
  });

  $(".inputRepassword").focus(function () {
    repasswordInputTouched = true;
  });
}

function inputsValidation() {
  if (nameInputTouched) {
    if (nameValidation()) {
      $("#nameAlert").removeClass("d-block").addClass("d-none");
    } else {
      $("#nameAlert").removeClass("d-none").addClass("d-block");
    }
  }

  if (emailInputTouched) {
    if (emailValidation()) {
      $("#emailAlert").removeClass("d-block").addClass("d-none");
    } else {
      $("#emailAlert").removeClass("d-none").addClass("d-block");
    }
  }

  if (phoneInputTouched) {
    if (phoneValidation()) {
      $("#phoneAlert").removeClass("d-block").addClass("d-none");
    } else {
      $("#phoneAlert").removeClass("d-none").addClass("d-block");
    }
  }

  if (ageInputTouched) {
    if (ageValidation()) {
      $("#ageAlert").removeClass("d-block").addClass("d-none");
    } else {
      $("#ageAlert").removeClass("d-none").addClass("d-block");
    }
  }

  if (passwordInputTouched) {
    if (passwordValidation()) {
      $("#passwordAlert").removeClass("d-block").addClass("d-none");
    } else {
      $("#passwordAlert").removeClass("d-none").addClass("d-block");
    }
  }

  if (repasswordInputTouched) {
    if (repasswordValidation()) {
      $("#repasswordAlert").removeClass("d-block").addClass("d-none");
    } else {
      $("#repasswordAlert").removeClass("d-none").addClass("d-block");
    }
  }

  if (
    nameValidation() &&
    emailValidation() &&
    phoneValidation() &&
    ageValidation() &&
    passwordValidation() &&
    repasswordValidation()
  ) {
    $("#submitBtn").removeClass("disabled");
  } else {
    $("#submitBtn").addClass("disabled", true);
  }
}

function nameValidation() {
  return /^[a-zA-Z ]+$/.test($(".inputName").val());
}

function emailValidation() {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    $(".inputEmail").val()
  );
}

function phoneValidation() {
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
    $(".inputPhone").val()
  );
}

function ageValidation() {
  return /^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/.test($(".inputAge").val());
}

function passwordValidation() {
  return /^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{8,}$/.test($(".inputPassword").val());
}

function repasswordValidation() {
  return $(".inputRepassword").val() === $(".inputPassword").val();
}
