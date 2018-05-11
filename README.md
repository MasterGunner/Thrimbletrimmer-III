# Thrimbletrimmer-III
Eustace W. Thrimbletrimmer the Third

Really like my 5th time attempting to re-write Thrimbletrimmer.

Game Plan:
* Rewrite the front end using just vanilla javascript and minimal jquery.
  * What I need is pretty straightforward, there's no need to bring a massive framework into it.
  * Plus Angular introduced more than a few problems and massively increased complexity. Other frameworks like React and Vue would probably be the same.
  * I can wrap a larger web-app around Thrimbletrimmer in the future, but the editor itself should stay self-contained.
* Once front-end is done, merge in Xanathor so the front and back ends are in the same project.
  * Then I can focus on updating Xanathor.
  * Probably make it as a standalone app first, then look at making a fork that can be published as a node plugin.
* Then the hard part: figuring out how Wubloader works and integrating it in directly as well.
