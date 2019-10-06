document.addEventListener("DOMContentLoaded", function () {
    let filmSearchObj = new filmSearch;
    filmSearchObj.createBasicMarkup();
});

function filmSearch() {
    this.apiKey = '1977b733';
    this.baseUrl = `https://www.omdbapi.com/?apiKey=${this.apiKey}`;
    this.currentURL = "";
    let context = this;
    this.timer = null;
    this.currentPage = null;
    this.currentTitle = "";
    this.searchMovieByName = function () {
        console.log(context);
        context.currentTitle = "";
        context.currentPage = null;
        if (context.timer) clearTimeout(context.timer);
        let filmOrSerialName = document.getElementById("search-film").value.trim().toLowerCase();
        filmOrSerialName.length >= 1 ? context.showClearButton() : context.hideClearButton();
        if (filmOrSerialName) {
            let nameParam = filmOrSerialName.length <= 3 ? "t" : "s";
            context.timer = setTimeout(function () {
                filmOrSerialName = filmOrSerialName.split(" ");
                filmOrSerialName.forEach(elem => {
                    if (elem) {
                        if (context.currentTitle) context.currentTitle += "+";
                        context.currentTitle += elem;
                    }
                });
                console.log(context.currentTitle);
                context.currentURL = `${context.baseUrl}&${nameParam}=${context.currentTitle}`;
                console.log(context.currentURL)
                context.getResultsFromServer(context.currentURL);
            }, 3000);
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
            .then(context.responseBodyProcessing)
            .catch(error => console.log(error));
    }
    this.responseBodyProcessing = function (json) {
        console.log(json);
        let anyFilms = document.querySelector(".any-films");
        if (anyFilms) anyFilms.remove();
        if (json.Response != "False") {
            context.currentResult = json;
            let pagination = document.getElementById("pagination");
            let ul = document.createElement("ul");
            while (pagination.firstChild) pagination.firstChild.remove();
            pagination.appendChild(ul);
            context.createDivForMovies();
            if ("Search" in json) {
                context.showTotalResults(json.Search.length, json.totalResults);
                context.createPagination(context.currentPage || 1, ul, Math.ceil(json.totalResults / 10));
                json.Search.forEach(item => {
                    context.movieOutput(item);
                });
            } else {
                context.showTotalResults(1, 1);
                context.createPagination(context.currentPage || 1, ul, 1);
                context.movieOutput(json);
            }
        }
    }
    this.showClearButton = function () {
        document.querySelector(".clear-search-line").classList.add("button_show");
        document.querySelector(".clear-search-line").classList.remove("button_hide");
    }
    this.hideClearButton = function () {
        document.querySelector(".clear-search-line").classList.add("button_hide");
        document.querySelector(".clear-search-line").classList.remove("button_show");
    }
    this.clearSearchLine = function () {
        document.getElementById("search-film").value = "";
        context.hideClearButton();
    }
    this.movieOutput = function (film) {
        let item = document.createElement("div");
        item.className = "item";
        item.id = film.imdbID;
        document.querySelector(".any-films").appendChild(item);

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
        itemButton.onclick = context.getMovieID;
        itemDescription.appendChild(itemButton);
    }
    this.createDivForMovies = function () {
        let anyFilms = document.createElement("div");
        anyFilms.className = "any-films";
        document.getElementById("blockForFilms").appendChild(anyFilms);
    }
    this.showTotalResults = function (length, totalPages) {
        document.querySelector(".total-results").innerHTML = `Показано с ${(context.currentPage ? context.currentPage - 1 : 0)*10+1} по 
        ${(context.currentPage ? context.currentPage - 1 : 0)*10+length} результатов из ${totalPages}`;
    }
    this.createPagination = function (page, block, pages) {
        console.log(pages);
        let otherpages = 4; //количество доступных страниц, за исключением первой и последней страницы
        console.log(page);
        if ((page) != 1) {
            let a = document.createElement("a");
            a.innerHTML = "1";
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
            a.onclick = context.newPageMovie;
            let li = document.createElement("li");
            li.appendChild(a);
            block.appendChild(li);
        }
    }
    this.newPageMovie = function () {
        window.scrollTo(0, 0);
        console.log(context);
        context.currentPage = parseInt(this.innerHTML);
        if (context.currentPage == 1 || !context.currentPage)
            context.currentPage = null;
        let pageParam = context.currentPage ? `&page=${context.currentPage}` : "";
        let URL = `${context.currentURL}${pageParam}`;
        console.log(URL);
        context.getResultsFromServer(URL);
    }
    this.getMovieID = function () {
        let id = this.parentNode.parentNode.id;
        console.log(id);
        let URL = `${context.baseUrl}&i=${id}`;
        fetch(URL)
            .then(request => request.json())
            .then(context.viewInfoAboutFilm)
    }
    this.viewInfoAboutFilm = function (obj) {
        while (document.body.firstChild) document.body.firstChild.remove();

        let containerForButton = document.createElement("div");
        containerForButton.className = "container";
        document.body.appendChild(containerForButton);

        let header = document.createElement("div");
        header.className = "header";
        containerForButton.appendChild(header);

        let home = document.createElement("a");
        home.innerHTML = "Home";
        home.onclick = context.backToMovieList;
        header.appendChild(home);

        let category = document.createElement("span");
        category.innerHTML = ` / ${obj.Type}`;
        header.appendChild(category);

        let container = document.createElement("div");
        container.className = "container";
        document.body.appendChild(container);

        let film = document.createElement("div");
        film.className = "film";
        container.appendChild(film);

        let poster = document.createElement("div");
        poster.className = "film__poster";
        film.appendChild(poster);

        if (obj.Poster != "N/A") {
            let image = document.createElement("img");
            image.className = "poster__image";
            image.setAttribute('src', obj.Poster);
            poster.appendChild(image);
        }

        let filmInfo = document.createElement("div");
        filmInfo.className = "film__info";
        film.appendChild(filmInfo);

        let filmRate = document.createElement("span");
        filmRate.className = "film__rate";
        filmRate.innerHTML = obj.imdbRating;
        filmInfo.appendChild(filmRate);

        let filmName = document.createElement("span");
        filmName.className = "film__name";
        filmName.innerHTML = obj.Title;
        filmInfo.appendChild(filmName);

        let yearFilm = document.createElement("span");
        yearFilm.className = "film__year";
        yearFilm.innerHTML = `${obj.Country}, ${obj.Year}`;
        filmInfo.appendChild(yearFilm);

        let filmGenre = document.createElement("span");
        filmGenre.className = "film__genre";
        filmGenre.innerHTML = obj.Genre;
        filmInfo.appendChild(filmGenre);

        let filmActors = document.createElement("div");
        filmActors.className = "film__actors";
        filmInfo.appendChild(filmActors);

        let mainActors = obj.Actors.split(",");
        mainActors.forEach(item => {
            let actor = document.createElement("span");
            actor.className = "actor";
            actor.innerHTML = item.trim();
            filmActors.appendChild(actor);
        });

        let filmDescription = document.createElement("div");
        filmDescription.className = "film__description";
        filmDescription.innerHTML = obj.Plot != "N/A" ? obj.Plot : "Описание данного фильма отсутствует";
        filmInfo.appendChild(filmDescription);
    }
    this.backToMovieList = function () {
        context.createBasicMarkup();
        context.responseBodyProcessing(context.currentResult);
        document.getElementById("search-film").value = context.currentTitle;
        context.showClearButton();
    }
    this.createBasicMarkup = function () {
        while (document.body.firstChild) document.body.firstChild.remove();

        let blockForInput = document.createElement("div");
        blockForInput.className = "container";
        let input = document.createElement("input");
        input.type = "text";
        input.name = "search-film";
        input.id = "search-film";
        input.placeholder = "Введите название фильма или сериала";
        let button = document.createElement("button");
        button.className = "clear-search-line button_hide";
        button.onclick = context.clearSearchLine;
        blockForInput.appendChild(input);
        blockForInput.appendChild(button);
        document.body.appendChild(blockForInput);

        let blockForFilms = document.createElement("div");
        blockForFilms.id = "blockForFilms";
        blockForFilms.className = "container";
        let totalResults = document.createElement("div");
        totalResults.className = "total-results";
        blockForFilms.appendChild(totalResults);
        document.body.appendChild(blockForFilms);

        let blockForPagination = document.createElement("div");
        blockForPagination.className = "container";
        let pagination = document.createElement("div");
        pagination.id = "pagination";
        pagination.className = "pagination";
        blockForPagination.appendChild(pagination);
        document.body.appendChild(blockForPagination);

        document.getElementById("search-film").addEventListener("input", context.searchMovieByName);
    }
}