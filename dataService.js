import { renderSingleVidReq } from "./renderSingleVidReq.js";
import { state } from "./client.js";
import api from "./api.js";
import { applyVoteStyle } from "./applyVoteStyle.js";
const listOfVidsElm = document.getElementById("listOfRequests");

export default {
    updateVote: (id, vote_type, user_id, state, isDone) => {
        const scoreVoteElm = document.getElementById(`score_vote_${id}`);
        return api.videoReq.update(id, vote_type, user_id).then((data) => {
            // console.log(data);
            scoreVoteElm.innerText = data.ups.length - data.downs.length;
            applyVoteStyle(id, data, isDone, state, vote_type);
        });
    },
    deleteVidReq: (id) => {
        return api.videoReq.delete(id).then((data) => window.location.reload());
    },
    addvideoReq: (formData) => {
        return api.videoReq.post(formData);
    },
    updateVideoStatus: (id, status, resVideo = "") => {
        return api.videoReq
            .update(id, status, resVideo)
            .then((data) => window.location.reload());
    },
    loadAllVidReqs: (
        sortBy = "newFirst",
        searchTerm = "",
        filterBy = "all",
        localState = state
    ) => {
        // console.log({sortBy})
        api.videoReq.get(sortBy, searchTerm, filterBy).then((data) => {
            listOfVidsElm.innerHTML = "";
            // console.log(data);

            data.forEach((vidInfo) => {
                renderSingleVidReq(vidInfo, localState);
            });
        });
    },
};