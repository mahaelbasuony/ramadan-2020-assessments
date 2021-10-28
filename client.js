const listOfVidsElm = document.getElementById("listOfRequests");

const state = {
    sortBy: "newFirst",
    searchTerm: "",
    userId: "",
};

function renderSingleVidReq(vidInfo, isPrepend = false) {
    const vidReqContainerElm = document.createElement("div");
    vidReqContainerElm.innerHTML = `
    <div class="card mb-3">
    <div class="card-body d-flex justify-content-between flex-row">
        <div class="d-flex flex-column">
            <h3>${vidInfo.topic_title}</h3>
            <p class="text-muted mb-2">${vidInfo.topic_details}</p>
           
            <p class="mb-0 text-muted">
            ${
              vidInfo.expected_result &&
              `<strong>Expected results:</strong> ${vidInfo.expected_result}`
            } 
            </p>
        </div>
        <div class="d-flex flex-column text-center">
            <a  id="votes_ups_${vidInfo._id}" class="btn btn-link">🔺</a>
            <h3 id="score_vote_${vidInfo._id}">${
    vidInfo.votes.ups.length - vidInfo.votes.downs.length
  }</h3>
            <a class="btn btn-link" id="votes_downs_${vidInfo._id}">🔻</a>
        </div>
    </div>
    <div class="card-footer d-flex flex-row justify-content-between">
        <div>
            <span class="text-info">${vidInfo.status.toUpperCase()}</span> &bullet; added by <strong>${
    vidInfo.author_name
  }</strong> on
            <strong>${new Date(
              vidInfo.submit_date
            ).toLocaleDateString()}</strong>
        </div>
        <div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
            <div class="badge badge-success">
               ${vidInfo.target_level}
            </div>
        </div>
    </div>
    </div>
    `;
  if (isPrepend) listOfVidsElm.prepend(vidReqContainerElm);
  else listOfVidsElm.appendChild(vidReqContainerElm);

  applyVoteStyle(vidInfo._id, vidInfo.votes);

  const scoreVoteElm = document.getElementById(`score_vote_${vidInfo._id}`);
  const votesElms = document.querySelectorAll(
    `[id^=votes_][id$=_${vidInfo._id}]`
  );
  //   console.log(votesElms);
  votesElms.forEach((elm) => {
    elm.addEventListener("click", function (e) {
      e.preventDefault();
      const [, vote_type, id] = e.target.getAttribute("id").split("_");
      fetch("http://localhost:7777/video-request/vote", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, vote_type, user_id: state.userId }),
      })
        .then((bolb) => bolb.json())
        .then((data) => {
          // console.log(data);
          scoreVoteElm.innerText = data.ups.length - data.downs.length;
          applyVoteStyle(id, data, vote_type);
        });
    });
  });
  //   voteUpsElm.addEventListener("click", (e) => {
  //     // console.log(e);
  //     fetch("http://localhost:7777/video-request/vote", {
  //       method: "PUT",
  //       headers: { "content-type": "application/json" },
  //       body: JSON.stringify({ id: vidInfo._id, vote_type: "ups" }),
  //     })
  //       .then((bolb) => bolb.json())
  //       .then((data) => {
  //         // console.log(data);
  //         scoreVoteElm.innerText = data.ups - data.downs;
  //       });
  //   });

  //   voteDownsElm.addEventListener("click", (e) => {
  //     // console.log(e);
  //     fetch("http://localhost:7777/video-request/vote", {
  //       method: "PUT",
  //       headers: { "content-type": "application/json" },
  //       body: JSON.stringify({ id: vidInfo._id, vote_type: "downs" }),
  //     })
  //       .then((bolb) => bolb.json())
  //       .then((data) => {
  //         scoreVoteElm.innerText = data.ups - data.downs;
  //       });
  //   });
}
function loadAllVidReqs(sortBy = "newFirst", searchTerm = "") {
  // console.log({sortBy})
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`
  )
    .then((blob) => blob.json())
    .then((data) => {
      listOfVidsElm.innerHTML = "";
      // console.log(data);

      data.forEach((vidInfo) => {
        renderSingleVidReq(vidInfo);
      });
    });
}
function debounce(fn, time) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
}

function checkValidate(formData) {
  const name = formData.get("author_name");
  const email = formData.get("author_email");
  const topic = formData.get("topic_title");
  const topicDetails = formData.get("topic_details");
  //   if (!name) {
  //     document.querySelector("[name=author_name]").classList.add("is-invalid");
  //   }
  //   const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  //   if (!email || !emailPattern.test(email)) {
  //     document.querySelector("[name=author_email]").classList.add("is-invalid");
  //   }
  if (!topicDetails) {
    document.querySelector("[name=topic_details").classList.add("is-invalid");
  }
  if (!topic || topic.length > 30) {
    document.querySelector("[name=topic_title]").classList.add("is-invalid");
  }
  const allInvalidElms = document
    .getElementById("formVideoRequest")
    .querySelectorAll(".is-invalid");
  if (allInvalidElms.length) {
    allInvalidElms.forEach((elm) => {
      elm.addEventListener("input", function () {
        this.classList.remove("is-invalid");
      });
    });
    return false;
  }

  return true;
}
function applyVoteStyle(video_id, votes_list, vote_type) {
  if (!vote_type) {
    if (votes_list.ups.includes(state.userId)) {
      vote_type = "ups";
    } else if (votes_list.downs.includes(state.userId)) {
      vote_type = "down";
    } else {
      return;
    }
  }
  const voteUpsElm = document.getElementById(`votes_ups_${video_id}`);
  const voteDownsElm = document.getElementById(`votes_downs_${video_id}`);

  const voteDirElm = vote_type === "ups" ? voteUpsElm : voteDownsElm;
  const otherDirElm = vote_type === "ups" ? voteDownsElm : voteUpsElm;
  if (votes_list[vote_type].includes(state.userId)) {
    voteDirElm.style.opacity = "1";
    otherDirElm.style.opacity = "0.5";
  } else {
    otherDirElm.style.opacity = "1";
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const formVidReqElm = document.getElementById("formVideoRequest");

  const sortByElms = document.querySelectorAll("[id*=sort_by_]");
  const searchBoxElm = document.getElementById("search_box");
  const formLoginElm = document.querySelector(".form-login");
  const appContentElm = document.querySelector(".app-content");
  if (window.location.search) {
    state.userId = new URLSearchParams(window.location.search).get("id");
    // console.log(userId);
    formLoginElm.classList.add("d-none");
    appContentElm.classList.remove("d-none");
  }
  loadAllVidReqs();
  sortByElms.forEach((elm) => {
    elm.addEventListener("click", function (e) {
      // console.log(e);
      e.preventDefault();
      state.sortBy = this.querySelector("input").value;

      // console.log(sortBy);
      loadAllVidReqs(state.sortBy);
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
      loadAllVidReqs(state.sortBy, state.searchTerm);
    }, 300)
  );
  formVidReqElm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(formVidReqElm);
    formData.append("author_id", state.userId);
    const isvalid = checkValidate(formData);
    if (!isvalid) return;
    // console.log(e);
    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    })
      .then((bolb) => bolb.json())
      .then((data) => {
        // console.log(data);
        renderSingleVidReq(data, (isPrepend = true));
      });
  });
});