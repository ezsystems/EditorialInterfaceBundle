<?php
/**
 * File containing the PreContentViewListener class.
 *
 * @copyright Copyright (C) 1999-2013 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\EditorialInterfaceBundle\EventListener;

use eZ\Publish\API\Repository\Repository;
use eZ\Publish\Core\MVC\Symfony\Event\PreContentViewEvent;

class PreContentViewListener
{
    /**
     * The repository
     *
     * @var \eZ\Publish\API\Repository\Repository
     */
    protected $repository;

    /**
     * The prefix of the meta data attributes
     *
     * @var string
     */
    protected $prefix;

    public function __construct( Repository $repository, $prefix )
    {
        $this->repository = $repository;
        $this->prefix = (string)$prefix;
    }

    /**
     * Injects meta data attributes at location level.
     *
     * @param \eZ\Publish\Core\MVC\Symfony\Event\PreContentViewEvent $event
     */
    public function onPreContentView( PreContentViewEvent $event )
    {
        $view = $event->getContentView();
        $content = $view->getParameter( 'content' );
        if (
            is_string( $view->getTemplateIdentifier() )
            && $this->repository->canUser( 'content', 'edit', $content )
        )
        {
            $location = $view->getParameter( 'location' );
            $meta = array(
                $this->prefix . 'editable-region' => 'true',
                $this->prefix . 'type-identifier' => $content->contentType->identifier,
                $this->prefix . 'location-id' => $location->id,
                $this->prefix . 'content-id' => $content->id,
                $this->prefix . 'locale-code' => $content->versionInfo->initialLanguageCode,
            );
            $view->addParameters(
                array(
                    'editorial_interface_meta' => $meta
                )
            );
        }
    }
}
