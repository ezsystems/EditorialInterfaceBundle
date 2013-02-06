<?php
/**
 * File containing the ContentExtension class.
 *
 * @copyright Copyright (C) 1999-2013 eZ Systems AS. All rights reserved.
 * @license http://www.gnu.org/licenses/gpl-2.0.txt GNU General Public License v2
 * @version //autogentag//
 */

namespace EzSystems\EditorialInterfaceBundle\Twig\Extension;

use Symfony\Component\DependencyInjection\ContainerInterface;
use eZ\Publish\API\Repository\Values\Content\Field;
use eZ\Publish\API\Repository\Repository;
use eZ\Publish\Core\Repository\Values\Content\Content;
use eZ\Publish\Core\MVC\ConfigResolverInterface;
use eZ\Publish\Core\MVC\Symfony\Templating\Twig\Extension\ContentExtension as CoreContentExtension;

class ContentExtension extends CoreContentExtension
{
    /**
     * The repository
     *
     * @var \eZ\Publish\API\Repository\Repository
     */
    protected $repository;

    /**
     * The prefix of the meta data attribute
     *
     * @var string
     */
    protected $prefix;

    public function __construct(
        ContainerInterface $container, Repository $repository,
        ConfigResolverInterface $resolver, $prefix
    )
    {
        parent::__construct( $container, $resolver );
        $this->repository = $repository;
        $this->prefix = (string)$prefix;
    }

    /**
     * Returns the metadata for the given $field in the $content.
     *
     * @param \eZ\Publish\Core\Repository\Values\Content\Content $content
     * @param \eZ\Publish\API\Repository\Values\Content\Field $field
     * @return array
     */
    protected function getMetadata( Content $content, Field $field )
    {
        $versionInfo = $content->getVersionInfo();

        return array(
            $this->prefix . 'field-id' => $field->id,
            $this->prefix . 'field-identifier' => $field->fieldDefIdentifier,
            $this->prefix . 'field-type-identifier' => $this->getFieldTypeIdentifier( $content, $field ),
            $this->prefix . 'content-id' => $versionInfo->getContentInfo()->id,
            $this->prefix . 'version' => $versionInfo->versionNo,
            $this->prefix . 'locale-code' => $field->languageCode
        );
    }

    /**
     * Generates the array of parameter to pass to the field template. For now
     * the metadata are only added if the current user is able to edit.
     *
     * @param \eZ\Publish\Core\Repository\Values\Content\Content $content
     * @param \eZ\Publish\Core\Repository\Values\Content\Field $field the Field to display
     * @param array $params An array of parameters to pass to the field view
     *
     * @return array
     */
    protected function getRenderFieldBlockParameters(
        Content $content, Field $field, array $params = array()
    )
    {
        $defaultParams = parent::getRenderFieldBlockParameters( $content, $field, $params );
        if ( $this->repository->canUser( 'content', 'edit', $content ) )
        {
            $defaultParams['attr'] += $this->getMetadata( $content, $field );
        }
        return $defaultParams;
    }

}


