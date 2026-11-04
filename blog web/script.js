
/* =========================================
   WEALTHSCOPEON - JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // ELEMENTS
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    const articleGrid = document.getElementById("articleGrid");
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    const categoryButtons = document.querySelectorAll("[data-category]");
    const tagButtons = document.querySelectorAll("[data-tag]");

    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");
    const pageNumbers = document.getElementById("pageNumbers");
    const pagination = document.getElementById("pagination");

    const noResults = document.getElementById("noResults");
    const currentYear = document.getElementById("currentYear");


    // MOBILE MENU
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", function () {
            navMenu.classList.toggle("show");
        });

        navMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navMenu.classList.remove("show");
            });
        });
    }


    // FOOTER YEAR
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // CATEGORY NAVIGATION FOR INNER PAGES
    window.goToCategory = function (category) {
        window.location.href =
            "index.html?category=" +
            encodeURIComponent(category) +
            "#articles";
    };


    // ARTICLE GRID CHECK
    // Inner pages do not have articleGrid.
    if (!articleGrid) {

        // CATEGORY LINKS ON INNER PAGES
        categoryButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                window.goToCategory(button.dataset.category);
            });
        });

        // TAG LINKS ON INNER PAGES
        tagButtons.forEach(function (tag) {
            tag.addEventListener("click", function (event) {
                event.preventDefault();

                window.location.href =
                    "index.html?tag=" +
                    encodeURIComponent(tag.dataset.tag) +
                    "#articles";
            });
        });

        // SEARCH FROM INNER PAGES
        if (searchForm && searchInput) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();

                const query = searchInput.value.trim();

                window.location.href =
                    "index.html?search=" +
                    encodeURIComponent(query) +
                    "#articles";
            });
        }

        return;
    }


    // ARTICLE SETTINGS
    const allArticles = Array.from(
        articleGrid.querySelectorAll(".article-card")
    );

    const articlesPerPage = 6;

    let currentPage = 1;
    let activeCategory = "all";
    let activeTag = "";


    // READ URL FILTERS
    const urlParams = new URLSearchParams(window.location.search);

    const urlCategory = urlParams.get("category");
    const urlTag = urlParams.get("tag");
    const urlSearch = urlParams.get("search");

    if (urlCategory) {
        activeCategory = urlCategory.toLowerCase();
    }

    if (urlTag) {
        activeTag = urlTag.toLowerCase();
    }

    if (urlSearch && searchInput) {
        searchInput.value = urlSearch;
    }


    // FILTER ARTICLES
    function getFilteredArticles() {

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        return allArticles.filter(function (article) {

            const category = (
                article.dataset.category || ""
            ).toLowerCase();

            const articleText = article.textContent.toLowerCase();

            const imageAlt = article.querySelector("img")
                ? article.querySelector("img").alt.toLowerCase()
                : "";

            const articleTags = (
                article.dataset.tags || ""
            ).toLowerCase();

            const matchesCategory =
                activeCategory === "all" ||
                category === activeCategory;

            const matchesSearch =
                !searchTerm ||
                articleText.includes(searchTerm) ||
                imageAlt.includes(searchTerm);

            const matchesTag =
                !activeTag ||
                articleTags.includes(activeTag) ||
                articleText.includes(activeTag) ||
                category.includes(activeTag.replace(/\s+/g, "-"));

            return (
                matchesCategory &&
                matchesSearch &&
                matchesTag
            );
        });
    }


    // DISPLAY ARTICLES
    function displayArticles() {

        const filteredArticles = getFilteredArticles();

        const totalPages = Math.ceil(
            filteredArticles.length / articlesPerPage
        );

        if (totalPages > 0 && currentPage > totalPages) {
            currentPage = totalPages;
        }

        const start = (currentPage - 1) * articlesPerPage;
        const end = start + articlesPerPage;

        const visibleArticles = filteredArticles.slice(start, end);

        allArticles.forEach(function (article) {
            article.style.display = "none";
        });

        visibleArticles.forEach(function (article) {
            article.style.display = "block";
        });


        // NO RESULTS
        if (noResults) {
            noResults.hidden = filteredArticles.length !== 0;
        }

        articleGrid.style.display =
            filteredArticles.length === 0 ? "none" : "grid";


        // PAGINATION
        if (pagination) {
            pagination.style.display =
                totalPages <= 1 ? "none" : "flex";
        }

        renderPagination(totalPages);
    }


    // CREATE PAGE BUTTONS
    function renderPagination(totalPages) {

        if (!pageNumbers) return;

        pageNumbers.innerHTML = "";

        if (totalPages <= 1) {
            updateNavigation(totalPages);
            return;
        }

        let pages = [];

        if (totalPages <= 5) {

            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }

        } else {

            pages = [1];

            if (currentPage > 3) {
                pages.push("...");
            }

            for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
            ) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }

            pages.push(totalPages);
        }


        pages.forEach(function (page) {

            if (page === "...") {

                const dots = document.createElement("span");
                dots.textContent = "...";
                pageNumbers.appendChild(dots);

            } else {

                const button = document.createElement("button");

                button.type = "button";
                button.className = "page-number";
                button.textContent = page;

                if (page === currentPage) {
                    button.classList.add("active");
                }

                button.addEventListener("click", function () {
                    currentPage = page;
                    displayArticles();
                    scrollToArticles();
                });

                pageNumbers.appendChild(button);
            }
        });

        updateNavigation(totalPages);
    }


    // PREVIOUS / NEXT NAVIGATION
    function updateNavigation(totalPages) {

        if (prevPage) {
            prevPage.disabled =
                currentPage <= 1 || totalPages === 0;
        }

        if (nextPage) {
            nextPage.disabled =
                currentPage >= totalPages || totalPages === 0;
        }
    }


    if (prevPage) {
        prevPage.addEventListener("click", function () {

            if (currentPage > 1) {
                currentPage--;
                displayArticles();
                scrollToArticles();
            }
        });
    }


    if (nextPage) {
        nextPage.addEventListener("click", function () {

            const totalPages = Math.ceil(
                getFilteredArticles().length / articlesPerPage
            );

            if (currentPage < totalPages) {
                currentPage++;
                displayArticles();
                scrollToArticles();
            }
        });
    }


    // SCROLL TO ARTICLES
    function scrollToArticles() {

        const articlesSection = document.getElementById("articles");

        if (articlesSection) {
            articlesSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }


    // CATEGORY FILTERING ON HOME PAGE
    categoryButtons.forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            activeCategory = (
                button.dataset.category || "all"
            ).toLowerCase();

            activeTag = "";
            currentPage = 1;

            categoryButtons.forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");

            tagButtons.forEach(function (tag) {
                tag.classList.remove("active");
            });

            displayArticles();
            scrollToArticles();
        });
    });


    // SEARCH FORM
    if (searchForm && searchInput) {

        searchForm.addEventListener("submit", function (event) {

            event.preventDefault();

            currentPage = 1;
            activeTag = "";

            tagButtons.forEach(function (tag) {
                tag.classList.remove("active");
            });

            displayArticles();
            scrollToArticles();
        });

        searchInput.addEventListener("input", function () {
            currentPage = 1;
            displayArticles();
        });
    }


    // TAG FILTERING ON HOME PAGE
    tagButtons.forEach(function (tag) {

        tag.addEventListener("click", function (event) {

            event.preventDefault();

            activeTag = (
                tag.dataset.tag || ""
            ).toLowerCase();

            activeCategory = "all";
            currentPage = 1;

            categoryButtons.forEach(function (button) {
                button.classList.remove("active");
            });

            tagButtons.forEach(function (item) {
                item.classList.remove("active");
            });

            tag.classList.add("active");

            displayArticles();
            scrollToArticles();
        });
    });


    // INITIAL ACTIVE CATEGORY
    categoryButtons.forEach(function (button) {
        button.classList.remove("active");

        if (
            button.dataset.category &&
            button.dataset.category.toLowerCase() === activeCategory
        ) {
            button.classList.add("active");
        }
    });

    tagButtons.forEach(function (tag) {
        tag.classList.remove("active");

        if (
            activeTag &&
            tag.dataset.tag.toLowerCase() === activeTag
        ) {
            tag.classList.add("active");
        }
    });


    // INITIAL DISPLAY
    displayArticles();

});
