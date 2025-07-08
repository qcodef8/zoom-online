function initTabs() {
    const url = new URL(window.location.href);
    const tabGroups = document.querySelectorAll(".tab-group");

    tabGroups.forEach((group) => {
        const groupId = group.id;
        const tabs = group.querySelectorAll(".tab");
        const contents = group.querySelectorAll(".tab-content");
        const activeTab = url.searchParams.get(groupId) || "1";

        function setActiveTab(tabNumber, updateURL = true) {
            tabs.forEach((tab) => {
                tab.classList.toggle("active", tab.dataset.tab === tabNumber);
            });

            contents.forEach((content) => {
                content.classList.toggle(
                    "active",
                    content.dataset.tab === tabNumber
                );
            });

            if (updateURL) {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set(groupId, tabNumber);
                history.replaceState(null, "", newUrl);
            }
        }

        // Click event
        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                setActiveTab(tab.dataset.tab);
            });
        });

        // Init on load
        setActiveTab(activeTab, false);
    });
}

initTabs();
