let wrapper = document.querySelector(".wrapper");
//showdown + extensions initilization
let converter = new showdown.Converter({
	extensions: ['youtube']
});
converter.setFlavor('github');

//main
async function getAllArticles(lowerLimit = 0, upperLimit = 1) {
	//clearing previous content
	clearWrapper();
	let bulkParent = document.createElement("section");
	bulkParent.classList.add("bulk-meta-data");

	for (counter=lowerLimit; counter<upperLimit; counter++) {
		let intermediateResult = await fetch(`/blogs/blog${counter}.json`, {
			headers:{
				'Content-Type': 'application/json'
			}
		});

		let result = await intermediateResult.json();

		let tempElement = document.createElement("article");

		tempElement.classList.add("bulk-blog");
		tempElement.innerHTML=`<h1 class="bulk-blog-heading">${result.heading}</h1> <h2 class="bulk-blog-author">${result.author}</h2> <p class="bulk-blog-tags-parent">${[...result.tags.split(" ")].map(tag=>{
			return `<span class="bulk-blog-tag">${tag}</span>`;
		}).join("")}</p> <p class="bulk-blog-date">${result.date}</p>`;

		bulkParent.appendChild(tempElement);

		counter++;
	}

	wrapper.appendChild(bulkParent);

}

async function getArticle(url = "/blogs/blog0") {
	//clearing previous content
	clearWrapper();

	//fetching data to render
	let fetchedMetaData = await fetch(url+".json", {
		headers:{
			'Content-Type': 'application/json'
		}
	});

	let fetchedData = await fetch(url+".md", {
		headers:{
			'Content-Type': 'text/plain'
		}
	});

	let metaData = await fetchedMetaData.json(),
	data = await fetchedData.text(),
	content = converter.makeHtml(data);

	let blog = document.createElement("article");
	blog.classList.add("blog");

	//tags used in blog
	let tagsParent = new Array();
	metaData.tags.split(" ").forEach(tag=>{
		tagsParent.push(`<span href="${tag}" class="blog-tag">${tag}</span>`);
	});
	
	//rendering
	blog.innerHTML = `<section class="blog-meta-data"> <h1 class="blog-heading">${metaData.heading}</h1>	<div class="blog-data"> <span class="blog-date">${metaData.date}</span> <span class="blog-author">${metaData.author}</span> </div> <section class="blog-tags">${tagsParent.join(" ")}</section> </section> ${content}`;

	wrapper.appendChild(blog);

	//post rendering
	//mermaid flowcharts
	mermaid.init();

	//highlight.js
	blog.querySelectorAll("code").forEach(elem=>{
		hljs.highlightBlock(elem);
	});

	//post render
	//responsive tables
	[...document.querySelectorAll("table")].map(table=>{
		let tempParent = document.createElement("div");
		tempParent.classList.add("blog-table-parent");

		let tempTable = document.createElement("table");
		
		tempTable.innerHTML=table.innerHTML;

		tempParent.appendChild(tempTable);
		table.replaceWith(tempParent);
	});
}

function clearWrapper() {
	while(wrapper.hasChildNodes()){
		wrapper.removeChild(wrapper.lastChild);
	}
}
