document.addEventListener("DOMContentLoaded", function () {
    let filmSearchObj = new FilmSearch;
    filmSearchObj.createBasicMarkup();
});

function FilmSearch() {
    let context = this;
    this.apiKey = '1977b733';
    this.baseUrl = `https://www.omdbapi.com/?apiKey=${this.apiKey}`;
    this.currentURL = "";
    this.timer = null;
    this.currentPage = null;
    this.pagesInMemory = {};
    this.currentTitle = "";
    this.searchMovieByName = function (e) {
        if (context.timer) clearTimeout(context.timer);
        let filmOrSerialName = e.target.value.trim();
        filmOrSerialName.length >= 1 ? context.showClearButton() : context.hideClearButton();
        if (filmOrSerialName) {
            let nameParam = filmOrSerialName.length <= 3 ? "t" : "s";
            context.timer = setTimeout(() => {
                context.currentTitle = "";
                context.currentPage = null;
                context.pagesInMemory = {};
                context.currentTitle = filmOrSerialName.toLowerCase().replace(/\s+/g, "+");
                document.querySelectorAll('.any-films').forEach(item => item.remove());
                let pagination = document.getElementById('pagination');
                while (pagination.firstChild) pagination.firstChild.remove();

                //РАбота с history api
                // let state;
                // state = {
                //     page: context.currentTitle
                // }
                // history.pushState(state, '', state.page + "/");

                console.log(context.currentTitle);
                context.currentURL = `${context.baseUrl}&${nameParam}=${context.currentTitle}`;
                console.log(context.currentURL)
                context.getResultsFromServer(context.currentURL);
            }, 500);
        }
    }
    this.getResultsFromServer = function (URL) {
        fetch(URL)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
            })
            .then(context.processBodyResponse)
            .catch(error => console.log(error));
    }
    this.processBodyResponse = function (json) {
        console.log(json);
        let pagination = document.getElementById("pagination");
        if (json.Response === "False") {
            document.getElementById("total-results").innerHTML = "По данному запросу ничего не было найдено";
            return;
        }
        let ul = document.createElement("ul");
        ul.id = `pagination-page-${context.currentPage || 1}`;
        pagination.appendChild(ul);
        let anyFilms = context.createDivForMovies();
        console.log(context.pagesInMemory);
        if ("Search" in json) {
            context.pagesInMemory[context.currentPage || 1] = context.showTotalResults(json.Search.length, json.totalResults);
            context.createPagination(context.currentPage || 1, ul, Math.ceil(json.totalResults / 10));
            json.Search.forEach(item => {
                context.movieOutput(item, anyFilms);
            });
        } else {
            context.pagesInMemory[context.currentPage || 1] = context.showTotalResults(1, 1);
            context.createPagination(context.currentPage || 1, ul, 1);
            context.movieOutput(json, anyFilms);
        }
    }
    this.showClearButton = function () {
        context.clearSearchLineButton.classList.remove("hidden");
    }
    this.hideClearButton = function () {
        context.clearSearchLineButton.classList.add("hidden");
    }
    this.clearSearchLine = function () {
        document.getElementById("search-film").value = "";
        context.hideClearButton();
    }
    this.movieOutput = function (film, anyFilms) {
        let item = document.createElement("div");
        item.className = "item";
        item.id = film.imdbID;
        anyFilms.appendChild(item);

        let itemName = document.createElement("div");
        itemName.className = "item__name";
        let filmName = film.Title;
        if (filmName.length > 40) filmName = `${filmName.slice(0,40)}...`;
        itemName.innerHTML = filmName;
        item.appendChild(itemName);

        let itemYear = document.createElement("div");
        itemYear.className = "item__year";
        itemYear.innerHTML = film.Year;
        item.appendChild(itemYear);

        let itemDescription = document.createElement("div");
        itemDescription.className = "item__description";
        itemDescription.innerHTML = "Нажмите на кнопку что узнать больше об этом фильме";
        item.appendChild(itemDescription);

        let itemButton = document.createElement("button");
        itemButton.className = "item__button";
        itemButton.innerHTML = "Узнать больше";
        itemButton.dataset.filmId = film.imdbID;
        itemButton.onclick = context.getMovieID;
        itemDescription.appendChild(itemButton);
    }
    this.createDivForMovies = function () {
        let anyFilms = document.createElement("div");
        anyFilms.className = "any-films";
        anyFilms.id = `any-films-${context.currentPage || 1}`;
        document.getElementById("blockForFilms").appendChild(anyFilms);
        return anyFilms;
    }
    this.showTotalResults = function (length, totalPages) {
        const totalResultsText = `Показано с ${(context.currentPage ? context.currentPage - 1 : 0)*10+1} по ${(context.currentPage ? context.currentPage - 1 : 0)*10+length} результатов из ${totalPages}`;
        document.getElementById("total-results").innerHTML = totalResultsText;
        return totalResultsText;
    }
    this.createPagination = function (page, block, pages) {
        console.log(pages);
        let otherpages = 4; //количество доступных страниц, за исключением первой и последней страницы
        console.log(page);
        if ((page) != 1) {
            let a = document.createElement("a");
            a.innerHTML = "1";
            a.dataset.page = 1;
            a.onclick = context.newPageMovie;
            let li = document.createElement("li");
            li.appendChild(a);
            block.appendChild(li);
        } else {
            let b = document.createElement("b");
            b.innerHTML = "1";
            let li = document.createElement("li");
            li.appendChild(b);
            block.appendChild(li);
        }

        let pagebeg = page - 2;

        if (pagebeg > Math.floor(otherpages / 2)) pagebeg = Math.floor(otherpages / 2);


        let pageend = pages - page - 1;
        if (pageend > Math.floor(otherpages / 2)) pageend = Math.floor(otherpages / 2);

        pagebeg > pageend ? pagebeg += otherpages - pagebeg - pageend : pageend += otherpages - pagebeg - pageend;

        pagebeg = page - pagebeg;
        if (pagebeg < 2) pagebeg = 2;

        pageend = page + pageend;
        if (pageend >= pages) pageend = pages - 1;

        if (pagebeg > 2) {
            let span = document.createElement("span");
            span.innerHTML = "...";
            let li = document.createElement("li");
            li.appendChild(span);
            block.appendChild(li);
        }

        for (let i = pagebeg; i < page; i++) {
            let a = document.createElement("a");
            a.innerHTML = i;
            a.dataset.page = i;
            a.onclick = context.newPageMovie;
            let li = document.createElement("li");
            li.appendChild(a);
            block.appendChild(li);
        }
        if (page && page != 1) {
            let b = document.createElement("b");
            b.innerHTML = page;
            let li = document.createElement("li");
            li.appendChild(b);
            block.appendChild(li);
        }

        for (let i = page + 1; i <= pageend; i++) {
            let a = document.createElement("a");
            a.innerHTML = i;
            a.dataset.page = i;
            a.onclick = context.newPageMovie;
            let li = document.createElement("li");
            li.appendChild(a);
            block.appendChild(li);
        }

        if (pageend < pages - 1) {
            let span = document.createElement("span");
            span.innerHTML = "...";
            let li = document.createElement("li");
            li.appendChild(span);
            block.appendChild(li);
        }

        if (page != pages) {
            let a = document.createElement("a");
            a.innerHTML = pages;
            a.dataset.page = pages;
            a.onclick = context.newPageMovie;
            let li = document.createElement("li");
            li.appendChild(a);
            block.appendChild(li);
        }
    }
    this.newPageMovie = function () {
        window.scrollTo(0, 0);
        console.log(context);
        document.getElementById(`any-films-${context.currentPage || 1}`).classList.add("hidden");
        document.getElementById(`pagination-page-${context.currentPage || 1}`).classList.add("hidden");
        context.currentPage = parseInt(this.dataset.page);
        if (context.currentPage == 1 || !context.currentPage) context.currentPage = null;
        if (context.pagesInMemory[context.currentPage || 1]) {
            document.getElementById("total-results").innerHTML = context.pagesInMemory[context.currentPage || 1];
            document.getElementById(`any-films-${context.currentPage || 1}`).classList.remove("hidden");
            document.getElementById(`pagination-page-${context.currentPage || 1}`).classList.remove("hidden");
        } else {
            let pageParam = context.currentPage ? `&page=${context.currentPage}` : "";
            let URL = `${context.currentURL}${pageParam}`;
            console.log(URL);
            context.getResultsFromServer(URL);
        }
        //Работа с history api
        // let state;
        // state = {
        //     page: context.currentPage || 1,
        //     name: context.currentTitle
        // }
        // history.pushState(state, '', `${state.page}`);
    }
    this.getMovieID = function () {
        let id = this.dataset.filmId;
        console.log(id);
        let URL = `${context.baseUrl}&i=${id}`;
        fetch(URL)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
            })
            .then(context.viewInfoAboutFilm)
            .catch(error => console.log(error));
    }
    this.viewInfoAboutFilm = function (obj) {
        document.getElementById("main").classList.add("hidden");

        let currentFilm = document.getElementById('current-film');
        currentFilm.classList.remove('hidden');

        currentFilm.querySelector(".header").lastElementChild.innerHTML = ` / ${obj.Type}`;
        if (obj.Poster != "N/A") {
            let image = document.createElement("img");
            image.className = "poster__image";
            image.setAttribute('src', obj.Poster);
            currentFilm.querySelector(".film__poster").innerHTML = "";
            currentFilm.querySelector(".film__poster").appendChild(image);
        }
        document.querySelector(".film__rate").innerHTML = obj.imdbRating;
        document.querySelector(".film__name").innerHTML = obj.Title;
        document.querySelector(".film__year").innerHTML = `${obj.Country}, ${obj.Year}`;
        document.querySelector(".film__genre").innerHTML = obj.Genre;
        let filmActors = document.querySelector(".film__actors");
        filmActors.innerHTML = "";
        let mainActors = obj.Actors.split(",");
        mainActors.forEach(item => {
            let actor = document.createElement("span");
            actor.className = "actor";
            actor.innerHTML = item.trim();
            filmActors.appendChild(actor);
        });
        document.querySelector(".film__description").innerHTML = obj.Plot != "N/A" ? obj.Plot : "Описание данного фильма отсутствует";
    }
    this.backToMovieList = function () {
        document.getElementById("main").classList.remove("hidden");
        document.getElementById("current-film").classList.add("hidden");
    }
    this.createBasicMarkup = function () {
        console.clear();
        context.clearSearchLineButton = document.getElementById("clear-search-line");
        document.getElementById("clear-search-line").onclick = context.clearSearchLine;
        document.getElementById("go-back").onclick = context.backToMovieList;
        document.getElementById("search-film").addEventListener("input", context.searchMovieByName);
        document.getElementById("search-film").addEventListener("focus", event => {
            event.target.classList.add("search-film_shadow");
        });
        document.getElementById("search-film").addEventListener("blur", event => {
            event.target.classList.remove("search-film_shadow");
        });
        // window.addEventListener('popstate', e => {
        //     console.log(e)
        // });
        // window.addEventListener('hashchange', (e) => {
        //     console.log(1 + location.hash);
        // });
    }
}