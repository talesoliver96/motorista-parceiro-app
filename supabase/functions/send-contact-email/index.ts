/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Para browser, a função precisa responder OPTIONS e incluir CORS headers.
// O próprio guia do Supabase recomenda isso.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Responde ao preflight do navegador.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();

    const {
      userId,
      name,
      email,
      category,
      subject,
      message,
    } = body;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const destinationEmail = Deno.env.get("CONTACT_DESTINATION_EMAIL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey || !destinationEmail) {
      return new Response(
        JSON.stringify({ error: "Credenciais de e-mail não configuradas" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Salva também no banco, se as variáveis do projeto estiverem disponíveis.
    if (supabaseUrl && supabaseServiceRoleKey) {
      await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseServiceRoleKey,
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_id: userId,
          name,
          email,
          category,
          subject,
          message,
        }),
      });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MotoristaParceiro <onboarding@resend.dev>",
        to: [destinationEmail],
        subject: `[Contato App] ${subject}`,
        html: `
          <h2>Novo contato do app</h2>
          <p><strong>Usuário:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Categoria:</strong> ${category}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${String(message).replace(/\n/g, "<br/>")}</p>
        `,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro inesperado",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});