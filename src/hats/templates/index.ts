export const mintTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested transfer:
- Chain to execute on: Must be one of ["ethereum", "base", ...] (like in viem/chains)
- Hat ID: Must be a valid hat ID which is a decimal or hexadecimal number. Eg: 1881804318505984011044986043100966942838 or 0x1234567890abcdef1234567890abcdef12345678
- Wearer address: Must be a valid Ethereum address starting with "0x"

If you are unsure about any of the parameters, you can ask the user to provide them.
Always confirm with the user if all the parameters are correct, before proceeding with the action.

Respond with a JSON markdown block containing only the extracted values:

\`\`\`json
{
    "chain": SUPPORTED_CHAINS,
    "hatId": string,
    "toAddress": string
}
\`\`\`
`;

export const revokeTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the requested transfer:
- Chain to execute on: Must be one of ["ethereum", "base", ...] (like in viem/chains)
- Hat ID: Must be a valid hat ID which is a decimal or hexadecimal number. Eg: 1881804318505984011044986043100966942838 or 0x1234567890abcdef1234567890abcdef12345678
- Wearer address: Must be a valid Ethereum address starting with "0x"
- Good standing: Must be a boolean value, refers to whether the user is good standing or not

If you are unsure about any of the parameters, you can ask the user to provide them.
Always confirm with the user if all the parameters are correct, before proceeding with the action.

Respond with a JSON markdown block containing only the extracted values:

\`\`\`json
{
    "chain": SUPPORTED_CHAINS,
    "hatId": string,
    "fromAddress": string,
    "goodStanding": boolean
}
\`\`\`
`;

export const balanceTemplate = `Given the recent messages and wallet information below:

{{recentMessages}}

{{walletInfo}}

Extract the following information about the user:
- Chain to execute on: Must be one of ["ethereum", "base", ...] (like in viem/chains)
- User address: Must be a valid Ethereum address starting with "0x"

Your response must be formatted as a JSON block with this structure:
\`\`\`json
{
    "chain": SUPPORTED_CHAINS,
    "hatId": string,
    "userAddress": string
}
\`\`\`
`;
