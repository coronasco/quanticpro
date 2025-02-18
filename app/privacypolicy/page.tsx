export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-3xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Informativa sulla Privacy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduzione</h2>
          <p className="text-gray-600">
            La presente Informativa sulla Privacy descrive come QuanticPro raccoglie, utilizza e protegge i dati personali degli utenti che utilizzano la nostra applicazione.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Dati Raccolti</h2>
          <p className="text-gray-600">Raccogliamo i seguenti tipi di dati:</p>
          <ul className="list-disc pl-6 mt-2 text-gray-600">
            <li>Informazioni dell&apos;account (email, nome)</li>
            <li>Dati finanziari (transazioni, incassi, spese)</li>
            <li>Dati di utilizzo dell&apos;applicazione</li>
            <li>Informazioni sul dispositivo</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Utilizzo dei Dati</h2>
          <p className="text-gray-600">Utilizziamo i dati raccolti per:</p>
          <ul className="list-disc pl-6 mt-2 text-gray-600">
            <li>Fornire e migliorare i nostri servizi</li>
            <li>Personalizzare l&apos;esperienza utente</li>
            <li>Inviare comunicazioni importanti</li>
            <li>Garantire la sicurezza dell&apos;account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Protezione dei Dati</h2>
          <p className="text-gray-600">
            Adottiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati personali da accessi non autorizzati, perdite o alterazioni.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. I Tuoi Diritti</h2>
          <p className="text-gray-600">Hai il diritto di:</p>
          <ul className="list-disc pl-6 mt-2 text-gray-600">
            <li>Accedere ai tuoi dati personali</li>
            <li>Richiedere la correzione dei dati</li>
            <li>Richiedere la cancellazione dei dati</li>
            <li>Opporti al trattamento dei dati</li>
            <li>Richiedere la portabilità dei dati</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Contatti</h2>
          <p className="text-gray-600">
            Per qualsiasi domanda sulla privacy, puoi contattarci all&apos;indirizzo: privacy@quanticpro.app
          </p>
        </section>
      </div>
    </div>
  );
}
