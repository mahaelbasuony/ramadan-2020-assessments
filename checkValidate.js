export function checkValidate(formData) {
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
            elm.addEventListener("input", function() {
                this.classList.remove("is-invalid");
            });
        });
        return false;
    }

    return true;
}