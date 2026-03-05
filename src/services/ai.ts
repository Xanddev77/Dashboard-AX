import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getFinancialAdvice(
  currentBalance: number,
  monthlyLimit: number,
  totalExpenses: number,
  recentTransactions: any[]
) {
  const model = "gemini-2.5-flash-lite-preview";
  
  const prompt = `
    Atue como um consultor financeiro pessoal amigável e sábio.
    Aqui estão os dados financeiros atuais do usuário:
    - Saldo Atual: R$ ${currentBalance}
    - Limite de Gastos Mensal Definido: R$ ${monthlyLimit}
    - Total Gasto neste Mês: R$ ${totalExpenses}
    - Transações Recentes: ${JSON.stringify(recentTransactions.slice(0, 5))}

    Por favor, forneça:
    1. Uma análise breve da situação atual (se está economizando bem ou gastando muito).
    2. Uma dica prática de economia baseada nos gastos recentes.
    3. Um aviso amigável se estiver perto ou acima do limite.
    
    Mantenha a resposta curta, direta e em português do Brasil. Use emojis para ser amigável.
    Não use formatação markdown complexa, apenas texto simples e parágrafos.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao obter conselho financeiro:", error);
    return "Desculpe, não consegui analisar suas finanças no momento. Tente novamente mais tarde! 🤖";
  }
}
