// const { filter } = require("bluebird");

import { debounce } from "./debounce.js";
import { renderSingleVidReq } from "./renderSingleVidReq.js";
import { checkValidate } from "./checkValidate.js";
import api from "./api.js";
import dataService from "./dataService.js";
const SUPER_USER_ID = "123";
export const state = {
    sortBy: "newFirst",
    searchTerm: "",
    filterBy: "all",
    userId: "",
    isSuperUser: false,
};

document.addEventListener("DOMContentLoaded", function() {
    const formVidReqElm = document.getElementById("formVideoRequest");

    const sortByElms = document.querySelectorAll("[id*=sort_by_]");
    const searchBoxElm = document.getElementById("search_box");
    const filterByElm = document.querySelectorAll("[id^=filter_by_]");
    const formLoginElm = document.querySelector(".form-login");
    const appContentElm = document.querySelector(".app-content");

    if (window.location.search) {
        state.userId = new URLSearchParams(window.location.search).get("id");
        // console.log(userId);
        if (state.userId === SUPER_USER_ID) {
            state.isSuperUser = true;
            document.querySelector(".normal-user-content").classList.add("d-none");
        }
        formLoginElm.classList.add("d-none");
        appContentElm.classList.remove("d-none");
    }
    dataService.loadAllVidReqs();
    // console.log(filterByElm);
    filterByElm.forEach((elm) => {
        elm.addEventListener("click", function(e) {
            e.preventDefault();
            state.filterBy = e.target.getAttribute("id").split("_")[2];
            filterByElm.forEach((option) => option.classList.remove("active"));
            this.classList.add("active");
            dataService.loadAllVidReqs(
                state.sortBy,
                state.searchTerm,
                state.filterBy
            );
        });
    });
    sortByElms.forEach((elm) => {
        elm.addEventListener("click", function(e) {
            // console.log(e);
            e.preventDefault();
            state.sortBy = this.querySelector("input").value;

            // console.log(sortBy);
            dataService.loadAllVidReqs(
                state.sortBy,
                state.searchTerm,
                state.filterBy
            );
            this.classList.add("active");
            if (state.sortBy === "topVotedFirst") {
                document.getElementById("sort_by_new").classList.remove("active");
            } else {
                document.getElementById("sort_by_top").classList.remove("active");
            }
        });
    });

    searchBoxElm.addEventListener(
        "input",
        debounce((e) => {
            state.searchTerm = e.target.value;
            dataService.loadAllVidReqs(
                state.sortBy,
                state.searchTerm,
                state.filterBy
            );
        }, 300)
    );
    formVidReqElm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(formVidReqElm);
        formData.append("author_id", state.userId);
        const isvalid = checkValidate(formData);
        if (!isvalid) return;
        dataService.addvideoReq(formData).then((data) => {
            renderSingleVidReq(data, state, (isPrepend = true));
        });
    });
});