import { Resend } from "resend";

const resend = new Resend("re_2mWqF4Ze_9dqKKukeGww7WGT5dqSUdYp2");

async function test() {
  try {
    const data = await resend.emails.send({
      from: "ironfitappadmin@gmail.com",
      to: "ironfitappadmin@gmail.com",
      subject: "Test",
      html: "<p>Test</p>",
    });
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
