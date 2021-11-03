import { applyVoteStyle } from "./applyVoteStyle.js";
import dataService from "./dataService.js";
const listOfVidsElm = document.getElementById("listOfRequests");

export function renderSingleVidReq(vidInfo, state, isPrepend = false) {
    const {
        _id,
        status,
        topic_title,
        topic_details,
        expected_result,
        video_ref,
        votes,
        author_name,
        submit_date,
        target_level,
    } = vidInfo;
    const vidReqContainerElm = document.createElement("div");
    vidReqContainerElm.innerHTML = `
   
    <div class="card mb-3">
    ${
      state.isSuperUser
        ? `
        <div class="card-header d-flex flex-row justify-content-between">
          <select id="admin_change_status_${_id}">
              <option value="new"> new</option>
              <option value="planned">planned</option>
              <option value="done">done</option>
          </select>
          <div class="input-group ml-3 mr-5 ${
            status !== "done" ? "d-none" : ""
          } " id="admin_video_res_container_${_id}">
              <input type="text" class="form-control" id="admin_video_res_${_id}" placeholder="paste here youtube"/>
              <div class="input-group-append">
                  <button class="btn btn-outline-secondary"  id="admin_save_video_res_${_id}" type="button">Save</button>
              </div>
          </div>
         <button class="btn btn-danger" id="admin_delete_video_req_${_id}">delete</button>
        </div>`
        : ""
    }
      <div class="card-body d-flex justify-content-between flex-row">
        <div class="d-flex flex-column">
            <h3>${topic_title}</h3>
            <p class="text-muted mb-2">${topic_details}</p>
           
            <p class="mb-0 text-muted">
            ${
              expected_result &&
              `<strong>Expected results:</strong> ${expected_result}`
            } 
            </p>
        </div>
       
        ${
          status === "done"
            ? ` <div class="ml-auto mr-3">
        <iframe width="240" height="135"
        src="http://www.youtube.com/embed/${video_ref.link}"
        frameborder='0' allowfullscreen></iframe>
    </div>`
            : ""
        }
        <div class="d-flex flex-column text-center">
            <a  id="votes_ups_${_id}" class="btn btn-link">🔺</a>
            <h3 id="score_vote_${_id}">${
    votes.ups.length - votes.downs.length
  }</h3>
            <a class="btn btn-link" id="votes_downs_${_id}">🔻</a>
        </div>
    </div>
    <div class="card-footer d-flex flex-row justify-content-between">
        <div class="${
          status === "done"
            ? "text-success"
            : status === "planned"
            ? "text-primary"
            : ""
        }">
            <span class="text-info">${status.toUpperCase()} ${
    status === "done"
      ? `on ${new Date(video_ref.date).toLocaleDateString()}`
      : ""
  }</span> &bullet; added by <strong>${author_name}</strong> on
            <strong>${new Date(submit_date).toLocaleDateString()}</strong>
        </div>
        <div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
            <div class="badge badge-success">
               ${target_level}
            </div>
        </div>
    </div>
    
    </div>
    `;
  if (isPrepend) listOfVidsElm.prepend(vidReqContainerElm);
  else listOfVidsElm.appendChild(vidReqContainerElm);
  const adminChangeStatusElm = document.getElementById(
    `admin_change_status_${_id}`
  );
  const adminVideoResElm = document.getElementById(`admin_video_res_${_id}`);
  const adminSaveVideoResElm = document.getElementById(
    `admin_save_video_res_${_id}`
  );
  const adminDeleteVideoReqElm = document.getElementById(
    `admin_delete_video_req_${_id}`
  );
  const adminVideoResContainer = document.getElementById(
    `admin_video_res_container_${_id}`
  );

  if (state.isSuperUser) {
    adminChangeStatusElm.value = status;
    adminVideoResElm.value = video_ref.link;
    adminChangeStatusElm.addEventListener("change", (e) => {
      // console.log(adminVideoResElm.value);
      if (e.target.value === "done") {
        adminVideoResContainer.classList.remove("d-none");
        dataService.updateVideoStatus(_id, e.target.value);
      } else {
        e.preventDefault();
        dataService.updateVideoStatus(_id, e.target.value);
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
      dataService.updateVideoStatus(_id, "done", adminVideoResElm.value);
    });
    adminDeleteVideoReqElm.addEventListener("click", (e) => {
      const isSure = confirm(`are you sure to delete${topic_title}`);
      if (!isSure) return;
      dataService.deleteVidReq(_id);
    });
  }
  applyVoteStyle(_id, votes, state, status == "done");

  const votesElms = document.querySelectorAll(`[id^=votes_][id$=_${_id}]`);
  //   console.log(votesElms);
  votesElms.forEach((elm) => {
    if (state.isSuperUser || status === "done") {
      return;
    }
    elm.addEventListener("click", function (e) {
      e.preventDefault();
      const [, vote_type, id] = e.target.getAttribute("id").split("_");
      dataService.updateVote(
        id,
        vote_type,
        state.userId,
        state,
        status == "done"
      );
    });
  });
}