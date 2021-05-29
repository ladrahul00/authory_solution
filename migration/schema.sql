CREATE TYPE ShareSite AS ENUM (
	'facebook',
	'twitter',
	'pinterest',
	'facebook_reactions',
	'linkedin_comments');

CREATE TABLE public."ShareCountHistory" (
	"articleId" int4 NULL,
	count int4 NOT NULL,
	site ShareSite NOT NULL,
	"timestamp" timestamptz NOT NULL,
	CONSTRAINT "ShareCountHistory_pkey" PRIMARY KEY (id)
);
