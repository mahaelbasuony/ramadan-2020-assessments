import { applyVoteStyle } from "./applyVoteStyle.js";
import API from "./api.js";
const listOfVidsElm = document.getElementById("listOfRequests");

export function renderSingleVidReq(vidInfo, state, isPrepend = false) {
    const vidReqContainerElm = document.createElement("div");
    vidReqContainerElm.innerHTML = `
   
    <div class="card mb-3">
    ${
      state.isSuperUser
        ? `
        <div class="card-header d-flex flex-row justify-content-between">
          <select id="admin_change_status_${vidInfo._id}">
              <option value="new"> new</option>
              <option value="planned">planned</option>
              <option value="done">done</option>
          </select>
          <div class="input-group ml-3 mr-5 ${
            vidInfo.status !== "done" ? "d-none" : ""
          } " id="admin_video_res_container_${vidInfo._id}">
              <input type="text" class="form-control" id="admin_video_res_${
                vidInfo._id
              }" placeholder="paste here youtube"/>
              <div class="input-group-append">
                  <button class="btn btn-outline-secondary"  id="admin_save_video_res_${
                    vidInfo._id
                  }" type="button">Save</button>
              </div>
          </div>
         <button class="btn btn-danger" id="admin_delete_video_req_${
           vidInfo._id
         }">delete</button>
        </div>`
        : ""
    }
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
       
        ${
          vidInfo.status === "done"
            ? ` <div class="ml-auto mr-3">
        <iframe width="240" height="135"
        src="http://www.youtube.com/embed/${vidInfo.video_ref.link}"
        frameborder='0' allowfullscreen></iframe>
    </div>`
            : ""
        }
        <div class="d-flex flex-column text-center">
            <a  id="votes_ups_${vidInfo._id}" class="btn btn-link">🔺</a>
            <h3 id="score_vote_${vidInfo._id}">${
    vidInfo.votes.ups.length - vidInfo.votes.downs.length
  }</h3>
            <a class="btn btn-link" id="votes_downs_${vidInfo._id}">🔻</a>
        </div>
    </div>
    <div class="card-footer d-flex flex-row justify-content-between">
        <div class="${
          vidInfo.status === "done"
            ? "text-success"
            : vidInfo.status === "planned"
            ? "text-primary"
            : ""
        }">
            <span class="text-info">${vidInfo.status.toUpperCase()} ${
    vidInfo.status === "done"
      ? `on ${new Date(vidInfo.video_ref.date).toLocaleDateString()}`
      : ""
  }</span> &bullet; added by <strong>${vidInfo.author_name}</strong> on
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
  const adminChangeStatusElm = document.getElementById(
    `admin_change_status_${vidInfo._id}`
  );
  const adminVideoResElm = document.getElementById(
    `admin_video_res_${vidInfo._id}`
  );
  const adminSaveVideoResElm = document.getElementById(
    `admin_save_video_res_${vidInfo._id}`
  );
  const adminDeleteVideoReqElm = document.getElementById(
    `admin_delete_video_req_${vidInfo._id}`
  );
  const adminVideoResContainer = document.getElementById(
    `admin_video_res_container_${vidInfo._id}`
  );

  if (state.isSuperUser) {
    adminChangeStatusElm.value = vidInfo.status;
    adminVideoResElm.value = vidInfo.video_ref.link;
    adminChangeStatusElm.addEventListener("change", (e) => {
      // console.log(adminVideoResElm.value);
      if (e.target.value === "done") {
        adminVideoResContainer.classList.remove("d-none");
        API.updateVideoStatus(vidInfo._id, e.target.value);
      } else {
        e.preventDefault();
        API.updateVideoStatus(vidInfo._id, e.target.value);
      }
    });
    adminSaveVideoResElm.addEventListener("click", (e) => {
      e.preventDefault();
      if (!adminVideoResElm.value) {
        adminVideoResElm.classList.add("is-invalid");
        adminVideoResElm.addEventListener("input", () => {
          adminVideoResElm.classList.remove("is-invalid");
        });
        return;
      }
      API.updateVideoStatus(vidInfo._id, "done", adminVideoResElm.value);
    });
    adminDeleteVideoReqElm.addEventListener("click", (e) => {
      const isSure = confirm(`are you sure to delete${vidInfo.topic_title}`);
      if (!isSure) return;
      fetch("http://localhost:7777/video-request", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: vidInfo._id,
        }),
      })
        .then((res) => res.json())
        .then((data) => window.location.reload());
    });
  }
  applyVoteStyle(vidInfo._id, vidInfo.votes, state, vidInfo.status == "done");

  const scoreVoteElm = document.getElementById(`score_vote_${vidInfo._id}`);
  const votesElms = document.querySelectorAll(
    `[id^=votes_][id$=_${vidInfo._id}]`
  );
  //   console.log(votesElms);
  votesElms.forEach((elm) => {
    if (state.isSuperUser || vidInfo.status === "done") {
      return;
    }
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
          applyVoteStyle(id, data, vidInfo.status === "done", state, vote_type);
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