const codeStructure = `mermaid

`;
function getPrompts(type, data) {
  console.log(data);
  if (type == "simpleDiagramPrompt") {
    console.log("small");
    if (data.params["size"] == "small")
      return `given is a title for a diagram, give me a simple mermaid code 
      that is strictly under 100 lines but strictly above 30 lines to
      best explain this scenario, decide on the best diagram type that
      is available in mermaid to best explain this diagram.Only give me the 
      mermaid code and nothing else.do not try to explain the code.and only give
      code to generate one diagram.and keep the diagram short and simple.It should be a 
      short and crisp diagram with less complexity.do not include anything in the beginning or end that 
      might cause mermaid parser to raise error.only give me the result as it is that can be accepted
      by mermaid parser.first line of the result must always start with the keyword 'mermaid'.
      DO NOT GIVE ME ANY NOTES other than providing me the code.DO NOT SAY ANY NOTE OR EXPLANATION IN THE END
      title : ${data["promptTitle"]}
      your reply structure : \`\`\`mermaid
                        //code
                        \`\`\``;
  }
  if (data.params["size"] == "large") {
    return `given is a title for a diagram, give me a complex mermaid code 
      that is strictly above 50 lines to
      best explain this scenario, decide on the best diagram type that
      is available in mermaid to best explain this diagram.Only give me the 
      mermaid code and nothing else.do not try to explain the code.and only give
      code to generate one diagram.try to explain the diagram in greater complexity.it should be
      an elaborate and complex diagram.do not include anything in the beginning or end that 
      might cause mermaid parser to raise error.only give me the result as it is that can be accepted
      by mermaid parser.first line of the result must always start with the keyword 'mermaid'.
      DO NOT GIVE ME ANY NOTES other than providing me the code.DO NOT SAY ANY NOTE OR EXPLANATION IN THE END
      title : ${data["promptTitle"]}
      result structure : \`\`\`mermaid
                        //code
                        \`\`\``;
  } else {
    return `given is a title for a diagram, give me the mermaid code to
      best explain this scenario, decide on the best diagram type that
      is available in mermaid to best explain this diagram.Only give me the 
      mermaid code and nothing else.do not try to explain the code.and only give
      code to generate one diagram.do not include anything in the beginning or end that 
      might cause mermaid parser to raise error.only give me the result as it is that can be accepted
      by mermaid parser.first line of the result must always start with the keyword 'mermaid'.
      DO NOT GIVE ME ANY NOTES other than providing me the code.DO NOT SAY ANY NOTE OR EXPLANATION IN THE END
      title : ${data["promptTitle"]}
      result structure : \`\`\`mermaid
                        //code
                        \`\`\``;
  }
}
module.exports = { getPrompts };
