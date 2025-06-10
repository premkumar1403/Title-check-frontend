import React from 'react'
import * as XLSX from "xlsx";

function Template() {
    const handleDownloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
          {
            Paper_ID: 1,
            Title: "AI in Healthcare",
            Author_Mail: "author1@example.com",
            Conference_Name: "ICTMIM",
            Decision_With_Comments: "Accepted",
            Precheck_Comments: "The Abstract must be between 150-200 words",
            Firstset_Comments:
              "The submitted manuscript appears to be entirely AI-generated, which undermines its originality and credibility. There is no evidence of original research, as the content lacks a clear research focus, methodology, and results. The references listed at the end of the article are not cited within the text.",
          },
          {
            Paper_ID: 2,
            Title: "Blockchain Security",
            Author_Mail: "author2@example.com",
            Conference_Name: "ICIMIA",
            Decision_With_Comments: "Revision sent",
            Precheck_Comments: "The proposed research work is incomplete",
            Firstset_Comments:
              "Avoid using abbreviations in the article title. Instead, use full words to accurately convey the topic of the research, Some minor language mistakes should be revised (Avoid using Personal Pronouns).",
          },
          {
            Paper_ID: 3,
            Title: "Quantum Computing Advances",
            Author_Mail: "author3@example.com",
            Conference_Name: "ICSSAS",
            Decision_With_Comments: "Rejected",
            Precheck_Comments: "Entire Methodology section is written using AI",
            Firstset_Comments:
              "The article appears to contain significant portions of AI-generated text, which undermines its originality and credibility.The references listed at the end of the article are not cited within the text",
          },
          {
            Paper_ID: 4,
            Title: "Edge Computing for IoT",
            Author_Mail: "author4@example.com",
            Conference_Name: "ICDICI",
            Decision_With_Comments: "Registered",
            Precheck_Comments:
              "The references cited in the article content does not match with the references cited at the end of an article",
            Firstset_Comments:
              "proposed methodology fig-1 is already exist - https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.sciencedirect.com%2Fscience%2Farticle%2Fpii%2FS0141933119304818&psig=AOvVaw27lho96Y3bUDY4JVdw6sNy&ust=1740294712788000&source=images&cd=vfe&opi=89978449&ved=0CBAQjRxqFwoTCOjs6dPd1osDFQAAAAAdAAAAABAE,Remove the AI generated Reference (21)",
          },
          {
            Paper_ID: 5,
            Title: "Ethics in AI",
            Author_Mail: "author5@example.com",
            Conference_Name: "ICICI",
            Decision_With_Comments: "Sent back to author",
            Precheck_Comments:
              "It is suggested to organize the conclusion and future scope section much better. This section should be presented in one 250-300 word paragraph.",
            Firstset_Comments:
              "Expand the keywords. Some sections in the manuscript are AI generated. The resultant image 4 exists-October weather - Post-monsoon autumn 2025 - Guntur, India, provide reference or citation. Remove unnecessary hyphens.",
          },
          {
            Paper_ID: 6,
            Title: "Ethics in AI",
            Author_Mail: "author5@example.com",
            Conference_Name: "ICICI",
            Decision_With_Comments: "Precheck",
            Precheck_Comments:
              "It is suggested to organize the conclusion and future scope section much better. This section should be presented in one 250-300 word paragraph.",
            Firstset_Comments:
              "Expand the keywords. Some sections in the manuscript are AI generated. The resultant image 4 exists-October weather - Post-monsoon autumn 2025 - Guntur, India, provide reference or citation. Remove unnecessary hyphens.",
          },
          {
            Paper_ID: 7,
            Title: "Ethics in AI",
            Author_Mail: "author5@example.com",
            Conference_Name: "ICICI",
            Decision_With_Comments: "1st comments Pending",
            Precheck_Comments:
              "It is suggested to organize the conclusion and future scope section much better. This section should be presented in one 250-300 word paragraph.",
            Firstset_Comments:
              "Expand the keywords. Some sections in the manuscript are AI generated. The resultant image 4 exists-October weather - Post-monsoon autumn 2025 - Guntur, India, provide reference or citation. Remove unnecessary hyphens.",
          },
          {
            Paper_ID: 8,
            Title: "Ethics in AI",
            Author_Mail: "author5@example.com",
            Conference_Name: "ICICI",
            Decision_With_Comments: "2nd comments Pending",
            Precheck_Comments:
              "It is suggested to organize the conclusion and future scope section much better. This section should be presented in one 250-300 word paragraph.",
            Firstset_Comments:
              "Expand the keywords. Some sections in the manuscript are AI generated. The resultant image 4 exists-October weather - Post-monsoon autumn 2025 - Guntur, India, provide reference or citation. Remove unnecessary hyphens.",
          },
          {
            Paper_ID: 9,
            Title: "Ethics in AI",
            Author_Mail: "author5@example.com",
            Conference_Name: "ICICI",
            Decision_With_Comments: "Withdraw",
            Precheck_Comments:
              "It is suggested to organize the conclusion and future scope section much better. This section should be presented in one 250-300 word paragraph.",
            Firstset_Comments:
              "Expand the keywords. Some sections in the manuscript are AI generated. The resultant image 4 exists-October weather - Post-monsoon autumn 2025 - Guntur, India, provide reference or citation. Remove unnecessary hyphens.",
          },
        ]);
    
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "Title_Template.xlsx");
      };
  return (
    <div>
      <button
        onClick={handleDownloadTemplate}
        className="text-sm text-white cursor-pointer bg-green-500 px-3 mt-5 py-2 rounded hover:bg-green-600"
      >
        ⬇ Download Excel Template
      </button>
    </div>
  );
}

export default Template